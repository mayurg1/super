-- Keep public post visibility separate from author ownership so an author can
-- update a post into its soft-deleted state without losing row visibility.

create or replace function public.can_read_post(p public.posts)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select p.deleted_at is null
    and p.status = 'published'
    and (
      p.visibility = 'public'
      or (
        p.visibility = 'campus'
        and p.campus_id = public.current_campus_id()
      )
    )
$$;

drop policy if exists posts_read on public.posts;
create policy posts_read
on public.posts
for select
to authenticated
using (
  author_id = auth.uid()
  or public.can_read_post(posts)
);
