import type { SupercampusSupabaseClient } from './client.js';

export interface AuthorizationRole {
  id: string;
  key: string;
  name: string;
  campusId: string | null;
  organizationId: string | null;
}

export interface AuthorizationFeature {
  key: string;
  name: string;
  description: string;
  moduleGroup: string;
  icon: string | null;
  route: string | null;
  sortOrder: number;
}

export interface AuthorizationSnapshot {
  roles: AuthorizationRole[];
  permissions: string[];
  features: AuthorizationFeature[];
  campusId: string | null;
}

const cache = new Map<string, Promise<AuthorizationSnapshot>>();

const empty = (campusId: string | null): AuthorizationSnapshot => ({
  roles: [],
  permissions: [],
  features: [],
  campusId,
});

export function createAuthorizationService(client: SupercampusSupabaseClient) {
  return {
    async load(
      userId: string,
      campusId: string | null,
      refresh = false,
    ): Promise<{ data: AuthorizationSnapshot; error: string | null }> {
      const key = `${userId}:${campusId ?? 'global'}`;
      let request = cache.get(key);

      if (refresh) {
        cache.delete(key);
        request = undefined;
      }

      if (!request) {
        request = (async () => {
          // 1) user_roles query
          const { data: userRoleRows, error: userRoleError } = await client
            .from('user_roles')
            .select('role_id,campus_id,expires_at,roles(id,key,name)')
            .eq('user_id', userId);
          if (userRoleError || !userRoleRows) throw userRoleError ?? new Error('user_roles returned no data');

          // 2) roles array
          const roles = userRoleRows
            .filter((a) => !a.expires_at || new Date(a.expires_at) > new Date())
            .filter((a) => !campusId || !a.campus_id || a.campus_id === campusId)
            .flatMap((a) =>
              a.roles
                ? [{ id: a.roles.id, key: a.roles.key, name: a.roles.name, campusId: a.campus_id, organizationId: null }]
                : [],
            );
          if (!roles.length) return empty(campusId);

          const ids = roles.map((r) => r.id);
          // 3+4) role_permissions + role_features queries
          const [grantsResult, assignmentsResult] = await Promise.all([
            client.from('role_permissions').select('permissions(key)').in('role_id', ids),
            client
              .from('role_features')
              .select('feature_registry(key,name,description,module_group,icon,route,sort_order,is_enabled)')
              .in('role_id', ids),
          ]);
          if (grantsResult.error || assignmentsResult.error) {
            throw grantsResult.error ?? assignmentsResult.error ?? new Error('grant queries failed');
          }

          // 5) final permissions array
          const permissions = [...new Set((grantsResult.data ?? []).flatMap((g) => (g.permissions ? [g.permissions.key] : [])))];

          // 6) final features array
          const features = new Map<string, AuthorizationFeature>();
          for (const assignment of assignmentsResult.data ?? []) {
            const feature = assignment.feature_registry;
            if (feature?.is_enabled) {
              features.set(feature.key, {
                key: feature.key,
                name: feature.name,
                description: feature.description,
                moduleGroup: feature.module_group,
                icon: feature.icon,
                route: feature.route,
                sortOrder: feature.sort_order,
              });
            }
          }
          // Super Admin bypass: super_admin is excluded from the role_features
          // seed (`where r.key <> 'super_admin'`), so the role_features join
          // returns zero features for this role. Query feature_registry directly
          // to grant ALL enabled features rather than relying on the join.
          // Permissions are unaffected (role_permissions.sql cross-joins every
          // permission to super_admin explicitly).
          if (roles.some((r) => r.key === 'super_admin')) {
            const { data: registryRows, error: registryError } = await client
              .from('feature_registry')
              .select('key,name,description,module_group,icon,route,sort_order,is_enabled')
              .eq('is_enabled', true)
              .order('sort_order', { ascending: true });
            if (registryError) throw registryError;
            features.clear();
            for (const f of registryRows ?? []) {
              features.set(f.key, {
                key: f.key,
                name: f.name,
                description: f.description,
                moduleGroup: f.module_group,
                icon: f.icon,
                route: f.route,
                sortOrder: f.sort_order,
              });
            }
          }

          return {
            roles,
            permissions,
            features: [...features.values()].sort((a, b) => a.sortOrder - b.sortOrder),
            campusId,
          };
        })();
        cache.set(key, request);
      }

      try {
        return { data: await request, error: null };
      } catch (error) {
        cache.delete(key);
        console.error('AUTH LOAD FAILED', error);
        return { data: empty(campusId), error: 'Authorization information could not be loaded.' };
      }
    },
    clearCache: () => cache.clear(),
  };
}

export type AuthorizationService = ReturnType<typeof createAuthorizationService>;
