-- Keep physical deletion moderator-only while allowing authors to soft-delete
-- their own active posts through an UPDATE.

drop policy if exists posts_update on public.posts;

create policy posts_update_author
on public.posts
for update
to authenticated
using (
  author_id = auth.uid()
  and status = 'published'
  and deleted_at is null
)
with check (
  author_id = auth.uid()
  and (
    (status = 'published' and deleted_at is null)
    or (status = 'removed' and deleted_at is not null)
  )
);

create policy posts_update_moderator
on public.posts
for update
to authenticated
using (public.has_permission('posts.moderate', campus_id))
with check (public.has_permission('posts.moderate', campus_id));

-- posts_read, posts_insert, and posts_delete remain unchanged:
-- reads remain visibility-aware, inserts require posts.create, and physical
-- deletes remain restricted to posts.moderate.
