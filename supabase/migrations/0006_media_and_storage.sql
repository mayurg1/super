create table public.media_assets (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references public.profiles(id) on delete restrict,
  bucket text not null, object_path text not null, mime_type text not null, byte_size bigint not null, checksum text,
  width integer, height integer, status text not null default 'active', created_at timestamptz not null default timezone('utc',now()), updated_at timestamptz not null default timezone('utc',now()), deleted_at timestamptz,
  unique(bucket,object_path), constraint media_path check(public.is_valid_object_path(object_path)), constraint media_size check(byte_size >= 0), constraint media_dimensions check((width is null and height is null) or (width > 0 and height > 0)), constraint media_status check(status in ('pending','active','deleted','quarantined'))
);
create index media_assets_owner_idx on public.media_assets(owner_id) where deleted_at is null;
create trigger media_assets_set_updated_at before update on public.media_assets for each row execute function public.set_updated_at();
alter table public.profiles add constraint profiles_avatar_asset_fk foreign key(avatar_asset_id) references public.media_assets(id) on delete set null;
alter table public.media_assets enable row level security;
create policy media_assets_read on public.media_assets for select to authenticated using(owner_id=auth.uid() or public.has_permission('media.manage'));
create policy media_assets_insert on public.media_assets for insert to authenticated with check(owner_id=auth.uid() and status='pending');
create policy media_assets_update on public.media_assets for update to authenticated using(owner_id=auth.uid() or public.has_permission('media.manage')) with check(owner_id=auth.uid() or public.has_permission('media.manage'));
create policy media_assets_delete on public.media_assets for delete to authenticated using(public.has_permission('media.manage'));

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values
 ('avatars','avatars',false,5242880,array['image/jpeg','image/png','image/webp']),
 ('post-media','post-media',false,26214400,array['image/jpeg','image/png','image/webp','video/mp4']),
 ('story-media','story-media',false,26214400,array['image/jpeg','image/png','image/webp','video/mp4']),
 ('marketplace-media','marketplace-media',false,10485760,array['image/jpeg','image/png','image/webp']),
 ('project-media','project-media',false,26214400,array['image/jpeg','image/png','image/webp','video/mp4']),
 ('event-media','event-media',false,26214400,array['image/jpeg','image/png','image/webp','video/mp4']),
 ('job-documents','job-documents',false,10485760,array['application/pdf','image/jpeg','image/png']),
 ('hostel-documents','hostel-documents',false,10485760,array['application/pdf','image/jpeg','image/png']),
 ('food-media','food-media',false,10485760,array['image/jpeg','image/png','image/webp']),
 ('chat-media','chat-media',false,26214400,array['image/jpeg','image/png','image/webp','application/pdf']),
 ('moderation-evidence','moderation-evidence',false,10485760,array['application/pdf','image/jpeg','image/png']) on conflict(id) do nothing;
create policy storage_owner_upload on storage.objects for insert to authenticated with check(bucket_id in ('avatars','post-media','story-media','marketplace-media','project-media','event-media','job-documents','hostel-documents','food-media','chat-media','moderation-evidence') and (storage.foldername(name))[1]=auth.uid()::text);
create policy storage_owner_update on storage.objects for update to authenticated using((storage.foldername(name))[1]=auth.uid()::text) with check((storage.foldername(name))[1]=auth.uid()::text);
create policy storage_owner_delete on storage.objects for delete to authenticated using((storage.foldername(name))[1]=auth.uid()::text);
-- Object reads are intentionally granted only by future parent-entity access functions; no bucket is public.
