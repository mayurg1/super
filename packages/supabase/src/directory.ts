import type { SupercampusSupabaseClient } from './client.js';
import type { Tables } from './database.types.js';

type ProfileRow = Tables<'profiles'>;

export interface DirectoryProfile {
  id: string;
  displayName: string;
  handle: string;
  givenName: string | null;
  familyName: string | null;
  bio: string | null;
  avatarAssetId: string | null;
  graduationYear: number | null;
  directoryVisibility: string;
  roleKey: string | null; // populated only when user_roles visible (self / rbac.manage)
}

export interface DirectoryQuery {
  campusId?: string | null;
  search?: string;
  cursor?: { createdAt: string };
  limit?: number;
}

export interface DirectoryPage {
  profiles: DirectoryProfile[];
  nextCursor: { createdAt: string } | null;
}

export type DirectoryResult<T> = { data: T; error: null } | { data: null; error: string };

const DEFAULT_PAGE_SIZE = 20;
const VISIBLE_ROLES = ['alumni', 'student', 'faculty'];

function dirError(): string {
  return 'Unable to load the directory. Please try again.';
}

function toProfile(row: ProfileRow & { user_roles?: Array<{ roles: { key: string } | null } | null> | null }): DirectoryProfile {
  let roleKey: string | null = null;
  if (row.user_roles) {
    for (const ur of row.user_roles) {
      if (ur?.roles?.key && VISIBLE_ROLES.includes(ur.roles.key)) { roleKey = ur.roles.key; break; }
    }
  }
  return {
    id: row.id,
    displayName: row.display_name,
    handle: row.handle,
    givenName: row.given_name,
    familyName: row.family_name,
    bio: row.bio,
    avatarAssetId: row.avatar_asset_id,
    graduationYear: row.graduation_year,
    directoryVisibility: row.directory_visibility,
    roleKey,
  };
}

export function createDirectoryService(client: SupercampusSupabaseClient) {
  return {
    async getPeopleByRole(role: string, query: DirectoryQuery): Promise<DirectoryResult<DirectoryPage>> {
      const limit = Math.max(1, Math.min(query.limit ?? DEFAULT_PAGE_SIZE, 50));
      let builder = client
        .from('profiles')
        .select('*, user_roles!user_id!inner(roles!inner(key))')
        .not('deleted_at', 'is', null)
        .eq('user_roles.roles.key', role)
        .order('created_at', { ascending: false })
        .limit(limit + 1);

      if (query.campusId) builder = builder.eq('campus_id', query.campusId);
      if (query.cursor) builder = builder.lt('created_at', query.cursor.createdAt);
      // RLS: user_roles_read restricts to self (user_id=auth.uid()) or rbac.manage.
      // Using !inner will therefore only return profiles whose user_roles the viewer can read.
      // For non-admin users this effectively returns zero rows for others' roles.
      // This is a known RLS limitation — a security-definer function would be needed.

      const { data, error } = await builder;
      if (error || !data) return { data: null, error: dirError() };

      const visible = data.slice(0, limit);
      if (visible.length === 0) return { data: { profiles: [], nextCursor: null }, error: null };
      const next = data.length > limit ? visible.at(-1) : undefined;
      return {
        data: { profiles: visible.map((r) => toProfile(r)), nextCursor: next ? { createdAt: next.created_at } : null },
        error: null,
      };
    },
    async getPersonProfile(profileId: string): Promise<DirectoryResult<DirectoryProfile>> {
      const { data, error } = await client.from('profiles').select('*').eq('id', profileId).single();
      if (error || !data) return { data: null, error: dirError() };
      return { data: toProfile(data), error: null };
    },
    async getConnectionRequests(userId: string): Promise<DirectoryResult<{ id: string; userId: string; requestedBy: string; status: string }[]>> {
      const { data, error } = await client
        .from('connections')
        .select('*')
        .or(`user_low_id.eq.${userId},user_high_id.eq.${userId}`)
        .eq('status', 'pending');
      if (error || !data) return { data: null, error: dirError() };
      const requests = data
        .filter((c) => c.requested_by !== userId)
        .map((c) => ({
          id: `${c.user_low_id}-${c.user_high_id}`,
          userId: c.user_low_id === userId ? c.user_high_id : c.user_low_id,
          requestedBy: c.requested_by,
          status: c.status,
        }));
      return { data: requests, error: null };
    },
  };
}

export type DirectoryService = ReturnType<typeof createDirectoryService>;