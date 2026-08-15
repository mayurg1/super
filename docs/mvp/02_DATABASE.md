# 02 — Database

> Compiled from `supabase/migrations/` (0001–0027). RLS is the security boundary on every table.

## Users & identity
- **`profiles`** — user identity: `id`(FK auth.users), `handle`(unique), `display_name`,
  `given_name`/`family_name`, `bio`, `campus_id`(FK campuses), `department_id`, `program_id`,
  `graduation_year`, `avatar_asset_id`(FK media_assets), `directory_visibility`, `is_active`. Created by
  `create_profile_for_user` trigger on `auth.users` insert. Used by: every page; API: `createProfileService`.

## RBAC / authorization (load-bearing)
- **`roles`** — 8 seeded roles. **`permissions`** — ~33 keys. **`features` (`feature_registry`)** — 16 registered features.
- **`user_roles`** — role assignment per user (+ optional campus scope & `expires_at`). **`role_permissions`**,
  **`role_features`** — grant tables.
- Used by: `createAuthorizationService` (roles/permissions/features snapshot), `has_permission`/`has_feature`
  (RLS functions), admin approval, navigation. **This layer powers feature gating, nav and admin gating — not dead code.**

## Campus directory
- **`campuses`**, **`departments`**, **`programs`** — reference data for onboarding and scoping.

## Feed
- **`posts`** (visibility, soft-delete, `search_document`), **`post_media`**, **`post_comments`**,
  **`post_likes`**, **`post_polls`**/`poll_options`/`poll_votes`, **`stories`**/`story_views`.
  Used by: `createFeedService`; API: list/create/like/comment.

## Marketplace
- **`marketplace_categories`**, **`marketplace_products`** (status: draft/active/reserved/sold/hidden/removed,
  `search_document`), **`product_media`**, **`product_favorites`**, **`product_reports`**.
  Used by: `createMarketplaceService`; API: browse/category/create/update/status/favorite/report/media.

## Food
- **`food_vendors`** (manager_id, status), **`food_menu_categories`**, **`food_menu_items`** (media_asset_id,
  is_available), **`food_orders`** (order_status, payment_status, snapshots, total_amount), **`food_order_items`**
  (title/price snapshots), **`food_order_events`**.
  Used by: `createFoodService`; API: vendors/menu/cart/place/cancel/history.

## Media & storage
- **`media_assets`** (owner, bucket, object_path, mime_type, byte_size, status) + private storage buckets
  (avatars, post-media, marketplace-media, food-media, …). Reads granted per parent-entity RLS.

## Moderation / misc (schema-ready)
- `moderations`, `moderation_actions`, `audit_logs`, `notifications`/`notification_deliveries`,
  `analytics_views`, `feature_flags`, `conversations`/`messages`/`message_receipts`, `events`/`event_registrations`,
  `jobs`/`job_applications`, `projects`/`project_members`/`project_skills`/`project_media`, `campaigns`/`campaign_contributions`,
  `campaign_updates`/`payment_transactions`, `hostel_*`, `profile_educations`/`profile_experiences`/`skills`/`user_settings`,
  `role_requests`.

## Relationships (summary)
`profiles → campuses/departments/programs/media_assets`; `user_roles → roles/campuses/profiles`;
`marketplace_products → profiles/campuses/categories`; `food_orders → profiles/food_vendors`;
`food_menu_items → food_vendors/media_assets`; `product_media/food_… → media_assets`.
