-- ---------------------------------------------------------------------------
-- 0028 Profile avatar read access
-- ---------------------------------------------------------------------------
-- WHY: Storage buckets are private and migration 0006 intentionally grants NO
-- storage.objects read policy, and public.media_assets reads are restricted to
-- the asset owner / media.manage. Without additions, a user cannot display their
-- own uploaded avatar (signed-URL creation does a SELECT on storage.objects) and
-- the community cannot view non-private profiles' avatars in the directory, feed
-- and chat. Mirrors the additive approach of 0026 (marketplace product media).
--
-- 1) media_assets: allow any authenticated viewer to read avatar metadata for a
--    profile that is not marked 'private' (their own avatar is already readable
--    via media_assets_read since they own the asset).
create policy media_assets_avatar_read
  on public.media_assets
  for select to authenticated
  using (
    bucket = 'avatars'
    and exists (
      select 1
      from public.profiles p
      where p.avatar_asset_id = media_assets.id
        and p.deleted_at is null
        and p.directory_visibility <> 'private'
    )
  );

-- 2) Allow opening (and building signed URLs to) the storage objects that back
--    avatars: the asset owner, and any authenticated user when the avatar's
--    profile is not private.
CREATE POLICY storage_profile_avatars_read
  on storage.objects
  for select to authenticated
  using (
    bucket_id = 'avatars'
    and exists (
      select 1
      from public.media_assets ma
      join public.profiles p on p.avatar_asset_id = ma.id
      where ma.bucket = 'avatars'
        and ma.object_path = name
        and ma.deleted_at is null
        and (
          ma.owner_id = auth.uid()
          or (p.deleted_at is null and p.directory_visibility <> 'private')
        )
    )
  );