# 07 — Marketplace

## Flow
- **Buyer:** browse (pagination) → filter by category → open product detail → save/favorite → report.
- **Seller:** create listing (title/desc/condition/price/category/media) → manage status
  (active → reserved → sold) → remove → see sales (status).

## Features (implemented)
Products, categories, search-ready (`search_document`), filters (category), favorites,
order/status transitions, reporting, seller profile link, multi-image upload + signed-URL display.

## UI
`MarketplacePage` → `CreateProductCard`, `CategoryFilter`, `ProductList` → `ProductCard`;
`ProductDetailPage` (detail, `ProductStatusControl`, `ReportListingButton`).
Provider: `MarketplaceProvider` (`useMarketplace`).

## APIs (`createMarketplaceService`, `packages/supabase/src/marketplace.ts`)
`getProducts`, `getProduct`, `getCategories`, `createProduct`, `updateProduct` (title/desc/condition/price/category/status),
`deleteProduct`, `favoriteProduct`, `unfavoriteProduct`, `reportProduct`, plus provider helpers
`uploadProductImages`, `getMediaUrls`.

## Database
`marketplace_categories`, `marketplace_products` (status enum, `search_document`), `product_media`,
`product_favorites`, `product_reports`, `media_assets` (+ storage bucket `marketplace-media`).
RLS: read active/seller/moderate; inserts seller + `marketplace.create`; updates seller/moderate;
product_media read for visible products (migration 0026).

## Media
Upload to `marketplace-media/{userId}/{uuid}.{ext}` (owner-only storage policy) → `media_assets`
(pending→active) → link `product_media`. Display via signed URLs (storage read granted by migration 0026).

## Seller vs Buyer
- Seller: own listings visible regardless of status; controls status; adds media.
- Buyer: sees `active` listings; can favorite/report; cannot modify.
