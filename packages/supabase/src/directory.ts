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

/** Richer read model for the public profile-detail page (RLS-gated). */
export interface PublicProfile {
  id: string;
  displayName: string;
  handle: string;
  givenName: string | null;
  familyName: string | null;
  headline: string | null;
  bio: string | null;
  avatarAssetId: string | null;
  graduationYear: number | null;
  designation: string | null;
  departmentId: string | null;
  departmentName: string | null;
  programId: string | null;
  programName: string | null;
  campusId: string | null;
  roleKey: string | null;
  roleLabel: string | null;
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

/** Single row shape returned by the list_directory_profiles RPC (jsonb). */
interface DirectoryRpcRow {
  profile_id: string;
  display_name: string;
  handle: string;
  given_name: string | null;
  family_name: string | null;
  bio: string | null;
  avatar_asset_id: string | null;
  graduation_year: number | null;
  directory_visibility: string;
  campus_id: string | null;
  created_at: string;
  role_key: string | null;
  role_label: string | null;
}

function toProfileFromRpc(row: DirectoryRpcRow): DirectoryProfile {
  return {
    id: row.profile_id,
    displayName: row.display_name,
    handle: row.handle,
    givenName: row.given_name,
    familyName: row.family_name,
    bio: row.bio,
    avatarAssetId: row.avatar_asset_id,
    graduationYear: row.graduation_year,
    directoryVisibility: row.directory_visibility,
    roleKey: row.role_key && VISIBLE_ROLES.includes(row.role_key) ? row.role_key : null,
  };
}

export function createDirectoryService(client: SupercampusSupabaseClient) {
  return {
    async getPeopleByRole(role: string, query: DirectoryQuery): Promise<DirectoryResult<DirectoryPage>> {
      const limit = Math.max(1, Math.min(query.limit ?? DEFAULT_PAGE_SIZE, 50));
      const { data, error } = await client.rpc('list_directory_profiles', {
        p_role: role,
        p_campus_id: query.campusId ?? undefined,
        p_search: query.search?.trim() || undefined,
        p_before: query.cursor?.createdAt ?? undefined,
        p_limit: limit + 1,
      });
      if (error || !Array.isArray(data)) return { data: null, error: dirError() };
      const rows = data as unknown as DirectoryRpcRow[];
      const visible = rows.slice(0, limit);
      if (visible.length === 0) return { data: { profiles: [], nextCursor: null }, error: null };
      const next = rows.length > limit ? visible.at(-1) : undefined;
      return {
        data: { profiles: visible.map((r) => toProfileFromRpc(r)), nextCursor: next ? { createdAt: next.created_at } : null },
        error: null,
      };
    },
    async getPersonProfile(profileId: string): Promise<DirectoryResult<DirectoryProfile>> {
      const { data, error } = await client.from('profiles').select('*').eq('id', profileId).single();
      if (error || !data) return { data: null, error: dirError() };
      return { data: toProfile(data), error: null };
    },
    async getPublicProfile(profileId: string): Promise<DirectoryResult<PublicProfile | null>> {
      const { data: row, error } = await client.from('profiles').select('*').eq('id', profileId).maybeSingle();
      if (error) return { data: null, error: dirError() };
      if (!row) return { data: null, error: null };

      let departmentName: string | null = null;
      if (row.department_id) {
        const { data: dept } = await client.from('departments').select('name').eq('id', row.department_id).maybeSingle();
        departmentName = dept?.name ?? null;
      }
      let programName: string | null = null;
      if (row.program_id) {
        const { data: prog } = await client.from('programs').select('name').eq('id', row.program_id).maybeSingle();
        programName = prog?.name ?? null;
      }

      // Role resolution: user_roles_read is self/admin-only, so a normal viewer
      // cannot read someone else's user_roles. Resolve the visible directory role
      // through the SECURITY DEFINER RPC instead (migration 0036).
      let roleKey: string | null = null;
      let roleLabel: string | null = null;
      const { data: roleJson } = await client.rpc('get_directory_user_role', { p_user_id: profileId });
      const role = (roleJson ?? null) as { role_key?: string | null; role_label?: string | null } | null;
      roleKey = role?.role_key ?? null;
      roleLabel = role?.role_label ?? null;

      return {
        data: {
          id: row.id,
          displayName: row.display_name,
          handle: row.handle,
          givenName: row.given_name,
          familyName: row.family_name,
          headline: row.headline,
          bio: row.bio,
          avatarAssetId: row.avatar_asset_id,
          graduationYear: row.graduation_year,
          designation: row.designation,
          departmentId: row.department_id,
          departmentName,
          programId: row.program_id,
          programName,
          campusId: row.campus_id,
          roleKey,
          roleLabel,
        },
        error: null,
      };
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