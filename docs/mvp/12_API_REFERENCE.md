# 12 — API Reference

All calls go through typed Supabase service façades in `packages/supabase/src`. There is no
self-hosted HTTP API (the BFF/`api-client` is unused).

## Auth — `auth.ts` / `AuthProvider`
`signIn({email,password})` · `signUp({email,password})` · `signOut()` · `updatePassword` ·
session restore/reset. Tables: `auth.users`, `profiles`.

## Profile — `profile.ts` / `ProfileProvider`
`bootstrap(user)` · `refresh(userId)` · `update(userId, changes)` · `find(userId)`.
Tables: `profiles`; param: profile fields; return: `Profile`.

## Authorization — `authorization.ts`
`load(userId, campusId, refresh)` → `{roles, permissions, features, campusId}`.
Tables: `user_roles`, `roles`, `role_permissions`, `permissions`, `role_features`, `feature_registry`.

## Role requests — `roleRequests.ts`
`create(input)` · `listMine()` · `listPending()` · `findRoleByKey(key)` · `approve(id, admin)` · `reject(id, admin, reason)`.
Tables: `role_requests`, `user_roles`.

## Feed — `feed.ts`
`getFeed` (paginated) · `createPost` · `deletePost` · `toggleLike` · `addComment` · `editComment` · `deleteComment`.
Tables: `posts`, `post_likes`, `post_comments` (+ `post_media`).

## Marketplace — `marketplace.ts`
`getProducts` / `getProduct` / `getCategories` / `createProduct` / `updateProduct` / `deleteProduct`
/ `favoriteProduct` / `unfavoriteProduct` / `reportProduct` (+ provider `uploadProductImages`, `getMediaUrls`).
Tables: `marketplace_products`, `marketplace_categories`, `product_media`, `product_favorites`, `product_reports`, `media_assets`.

## Food — `food.ts`
`getVendors(campusId)` · `getMenu(vendorId)` · `getOrders(buyerId)` · `placeOrder(input)` · `cancelOrder`.
Tables: `food_vendors`, `food_menu_categories`, `food_menu_items`, `food_orders`, `food_order_items`, `food_order_events`.

## Storage — `storage.ts`
`createStorage(client)` → `client.storage` (buckets managed by migration 0006).

## Realtime — `realtime.ts`
`createRealtime(client)` → `client.channel` façade (used ad hoc by food orders).

Each façade returns `{ data, error }` (`XxxResult<T>`); errors are human-readable.
