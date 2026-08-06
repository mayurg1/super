-- Parent-post authors retain access to child resources after a private or
-- soft-deleted post leaves the public feed. Other readers remain subject to
-- the normal published-post visibility helper.

drop policy if exists post_media_read on public.post_media;
create policy post_media_read
on public.post_media
for select
to authenticated
using (
  exists (
    select 1
    from public.posts p
    where p.id = post_media.post_id
      and (p.author_id = auth.uid() or public.can_read_post(p))
  )
);

drop policy if exists post_comments_read on public.post_comments;
create policy post_comments_read
on public.post_comments
for select
to authenticated
using (
  exists (
    select 1
    from public.posts p
    where p.id = post_comments.post_id
      and (p.author_id = auth.uid() or public.can_read_post(p))
  )
);

drop policy if exists post_likes_read on public.post_likes;
create policy post_likes_read
on public.post_likes
for select
to authenticated
using (
  exists (
    select 1
    from public.posts p
    where p.id = post_likes.post_id
      and (p.author_id = auth.uid() or public.can_read_post(p))
  )
);

drop policy if exists post_polls_read on public.post_polls;
create policy post_polls_read
on public.post_polls
for select
to authenticated
using (
  exists (
    select 1
    from public.posts p
    where p.id = post_polls.post_id
      and (p.author_id = auth.uid() or public.can_read_post(p))
  )
);

drop policy if exists poll_options_read on public.poll_options;
create policy poll_options_read
on public.poll_options
for select
to authenticated
using (
  exists (
    select 1
    from public.post_polls pp
    join public.posts p on p.id = pp.post_id
    where pp.id = poll_options.poll_id
      and (p.author_id = auth.uid() or public.can_read_post(p))
  )
);
