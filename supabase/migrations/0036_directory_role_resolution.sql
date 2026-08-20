-- ---------------------------------------------------------------------------
-- 0036 Directory role resolution via SECURITY DEFINER helpers
-- ---------------------------------------------------------------------------
-- WHY:
--   getPeopleByRole resolved a member's role by joining `user_roles!inner`
--   with a PostgREST "inner" filter, then filtering on roles.key. But the RLS
--   policy `user_roles_read` (0005) only permits `user_id = auth.uid()` or an
--   admin with `rbac.manage`. A normal authenticated user can therefore never
--   read another member's user_roles row, so the !inner join returns zero rows
--   for every profile except their own -- the directory lists only oneself.
--
--   This is the same "actor-only / non-participant" RLS pattern flagged
--   migration 0035. The directory must resolve a *visible* member's role
--   WITHOUT requiring the caller to have row-level read access to that user's
--   user_roles.
--
-- FIX:
--   Expose two SECURITY DEFINER functions (same pattern as 0035's
--   is_user_conversation_member). They run as the function owner, so their
--   internal scans of user_roles/roles bypass RLS; the *visibility* gate is
--   re-applied explicitly inside using current_profile_id()/current_campus_id()
--   so a caller can only resolve a role for a profile the directory would
--   already show them. No user_roles read grant is widened.
-- ---------------------------------------------------------------------------

-- Resolves the single active directory role (key + label) for one profile.
create or replace function public.get_directory_user_role(p_user_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare role_json jsonb;
begin
  select jsonb_build_object('role_key', r.key, 'role_label', r.name)
    into role_json
  from public.profiles p
  join public.user_roles ur on ur.user_id = p.id
    and (ur.expires_at is null or ur.expires_at > timezone('utc', now()))
  join public.roles r on r.id = ur.role_id
  where p.id = p_user_id
    and r.key in ('student', 'alumni', 'faculty')
    and ( p.id = public.current_profile_id()
          or p.directory_visibility = 'public'
          or ( p.directory_visibility = 'campus'
               and p.campus_id = public.current_campus_id() ) )
  limit 1;
  return role_json;
end;
$$;

-- Returns the page of profiles for a directory role, with their role keys,
-- honoring the same visibility rules as profiles_read.
create or replace function public.list_directory_profiles(
  p_role text,
  p_campus_id uuid default null,
  p_search text default null,
  p_before timestamptz default null,
  p_limit integer default 20
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  result jsonb;
begin
  select coalesce(jsonb_agg(jsonb_build_object(
      'profile_id', row.id,
      'display_name', row.display_name,
      'handle', row.handle,
      'given_name', row.given_name,
      'family_name', row.family_name,
      'bio', row.bio,
      'avatar_asset_id', row.avatar_asset_id,
      'graduation_year', row.graduation_year,
      'directory_visibility', row.directory_visibility,
      'campus_id', row.campus_id,
      'created_at', row.created_at,
      'role_key', row.role_key,
      'role_label', row.role_label
    )), '[]'::jsonb)
    into result
  from (
    select p.id, p.display_name, p.handle, p.given_name, p.family_name, p.bio,
           p.avatar_asset_id, p.graduation_year, p.directory_visibility,
           p.campus_id, p.created_at,
           r.key as role_key, r.name as role_label
    from public.profiles p
    join public.user_roles ur on ur.user_id = p.id
      and (ur.expires_at is null or ur.expires_at > timezone('utc', now()))
    join public.roles r on r.id = ur.role_id
    where p.deleted_at is null
      and r.key = p_role
      and ( p.id = current_profile_id()
            or p.directory_visibility = 'public'
            or ( p.directory_visibility = 'campus'
                 and p.campus_id = current_campus_id() ) )
      and (p_campus_id is null or p.campus_id = p_campus_id)
      and ( p_search is null or p_search = ''
            or p.display_name ilike '%' || p_search || '%'
            or p.handle ilike '%' || p_search || '%' )
      and (p_before is null or p.created_at < p_before)
    order by p.created_at desc
    limit p_limit
  ) row;
  return result;
end;
$$;

revoke all on function public.get_directory_user_role(uuid) from public;
revoke all on function public.list_directory_profiles(text, uuid, text, timestamptz, integer) from public;
grant execute on function public.get_directory_user_role(uuid) to authenticated;
grant execute on function public.list_directory_profiles(text, uuid, text, timestamptz, integer) to authenticated;