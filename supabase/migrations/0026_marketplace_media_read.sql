-- ---------------------------------------------------------------------------
-- 0026 Marketplace product media read access
-- ---------------------------------------------------------------------------
-- WHY: Storage buckets are private and migration 0006 intentionally grants NO
-- storage.objects read policy ("Object reads are intentionally granted only by
-- future parent-entity access functions"), and public.media_assets reads are
-- restricted to the asset owner / media.manage. Without these, product images
-- cannot be displayed to authenticated viewers (they could not read the storage
-- object NOR the media_assets metadata needed to build a signed URL).
--
-- These two policies are additive and scope reads ONLY to product media on
-- listings the viewer can already see via existing marketplace RLS
-- (active + not deleted, their own listing, or marketplace.moderate). No other
-- buckets or tables are touched.

-- 1) Allow viewers to read the media_assets metadata (bucket/object_path) that
--    backs product media on readable listings.
create policy media_assets_product_read
  on public.media_assets
  for select to authenticated
  using (
    exists (
      select 1
      from public.product_media pm
      join public.marketplace_products p on p.id = pm.product_id
      where pm.media_asset_id = media_assets.id
        and (
          (p.status = 'active' and p.deleted_at is null)
          or p.seller_id = auth.uid()
          or public.has_permission('marketplace.moderate', p.campus_id)
        )
    )
  );

-- 2) Allow viewers to open (and build signed URLs to) the storage objects that
--    back product media on readable listings.
create policy marketplace_product_media_read
  on storage.objects
  for select to authenticated
  using (
    bucket_id = 'marketplace-media'
    and exists (
      select 1
      from public.media_assets ma
      join public.product_media pm on pm.media_asset_id = ma.id
      join public.marketplace_products p on p.id = pm.product_id
      where ma.bucket = 'marketplace-media'
        and ma.object_path = name
        and (
          (p.status = 'active' and p.deleted_at is null)
          or p.seller_id = auth.uid()
          or public.has_permission('marketplace.moderate', p.campus_id)
        )
    )
  );
