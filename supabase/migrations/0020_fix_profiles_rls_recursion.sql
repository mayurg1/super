-- Eliminate self-referential profiles RLS evaluation without changing visibility rules.
create or replace function public.current_profile_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$ select auth.uid() $$;

create or replace function public.current_campus_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select p.campus_id
  from public.profiles p
  where p.id = auth.uid()
  limit 1
$$;

revoke all on function public.current_profile_id() from public;
revoke all on function public.current_campus_id() from public;
grant execute on function public.current_profile_id() to authenticated;
grant execute on function public.current_campus_id() to authenticated;

drop policy if exists profiles_read on public.profiles;
create policy profiles_read
on public.profiles
for select
to authenticated
using (
  deleted_at is null
  and (
    id = public.current_profile_id()
    or directory_visibility = 'public'
    or (
      directory_visibility = 'campus'
      and campus_id is not null
      and campus_id = public.current_campus_id()
    )
  )
);

-- The audited policies do not otherwise query their own protected relation.
-- Replace direct profile lookups in non-profile policies with the same safe helper.
create or replace function public.can_read_post(p public.posts)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select p.deleted_at is null and p.status = 'published'
    and (p.author_id = auth.uid() or p.visibility = 'public'
      or (p.visibility = 'campus' and p.campus_id = public.current_campus_id()))
$$;

drop policy if exists stories_read on public.stories;
create policy stories_read on public.stories for select to authenticated using (
  deleted_at is null and status = 'active' and expires_at > timezone('utc', now())
  and (author_id = auth.uid() or visibility = 'public' or campus_id = public.current_campus_id())
);
