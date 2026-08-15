# 06 — UI Screens

One section per implemented screen.

## Login / Signup / Reset password — `pages/LoginPage.tsx`
- **Purpose:** authenticate, create account, reset password.
- **Components:** `AuthCard`, `Input`, `Button`.
- **API:** `useAuth().signIn/signUp`.
- **Tables:** `auth.users`, `profiles`.
- **State:** local form fields + loading/error; `useAuth` session.

## Onboarding — `pages/OnboardingPage.tsx`
- **Purpose:** profile setup + role request (steps: welcome→profile→academic→role→review).
- **Components:** `Input`, `Button`, `Card`, step selectors.
- **API:** `useProfile().updateProfile`, `useRoleRequests().createRequest`.
- **Tables:** `campuses`, `departments`, `programs`, `profiles`, `role_requests`.
- **State:** local step machine; `useUserApplicationState`.

## Pending approval — `pages/PendingApprovalPage.tsx`
- **Purpose:** show role-request status; auto-progress when approved.
- **Components:** request status card, "Check status".
- **API:** `useAuthorization().refreshAuthorization`, `useProfile().refreshProfile`, `useRoleRequests().refresh`.
- **Tables:** `role_requests`, `user_roles`.
- **State:** polls providers (~15s).

## Feed — `app/feed/`
- **Purpose:** campus social feed (posts/likes/comments/pagination).
- **Components:** `FeedPage`, `FeedList`, `FeedCard`, `CreatePostCard`/`PostComposer`, `CommentThread`,
  `CommentComposer`, `EmptyFeed`, `ErrorState`, `LoadingSkeleton`.
- **API:** `createFeedService` via `FeedProvider`.
- **Tables:** `posts`, `post_comments`, `post_likes` (+ `post_media`, polls/stories schema-ready).
- **State:** `FeedProvider` (list, cursor, optimistic like/comment), `useUserApplicationState`.

## Dashboard — `app/dashboard/`
- **Purpose:** welcome + quick actions + pinned/available modules + stat cards.
- **Components:** `DashboardPage`, `DashboardCard`/`Section`/`Layout`.
- **API:** `useProfile`, `useRoles`, `useDashboard` (buildDashboard(features, quickActions)).
- **Tables:** `profiles`, `user_roles`/`roles`/`role_features`/`feature_registry`.
- **State:** `DashboardProvider`.

## Marketplace — `app/marketplace/`
- **Purpose:** list/browse/create/favorite/status/report/media/detail.
- **Components:** `MarketplacePage`, `CreateProductCard`, `CategoryFilter`, `ProductList`, `ProductCard`,
  `ProductDetailPage` (+`ProductStatusControl`, `ReportListingButton`).
- **API:** `createMarketplaceService` via `MarketplaceProvider` (refresh/loadMore/setCategory/getProduct/
  createProduct/updateProduct/deleteProduct/toggleFavorite/reportProduct/hasReported/uploadProductImages/getMediaUrls).
- **Tables:** `marketplace_categories`, `marketplace_products`, `product_media`, `product_favorites`, `product_reports`, `media_assets`.
- **State:** `MarketplaceProvider` (list, cursor, category, pending favorites, optimistic).

## Food — `app/food/`
- **Purpose:** order from campus vendors.
- **Components:** `FoodPage`, `VendorPicker`, `MenuList`, `MenuItemCard`, `CartPanel`, `OrderHistory`,
  `VendorChangeConfirm`, hooks `useFoodVendors/Menu/Cart/Orders`.
- **API:** `createFoodService` via `FoodProvider`.
- **Tables:** `food_vendors`, `food_menu_categories`, `food_menu_items`, `food_orders`, `food_order_items`, `food_order_events`.
- **State:** `FoodProvider` (cart persisted to localStorage per vendor, orders, realtime refresh).

## Admin requests — `pages/AdminRequestsPage.tsx` / `AdminRequestDetailPage.tsx`
- **Purpose:** review/approve/reject role requests.
- **Components:** request list, detail actions.
- **API:** `useRoleRequests` (`listPending`, `approve`, `reject`).
- **Tables:** `role_requests`, `user_roles`.
- **State:** `RoleRequestsProvider` (`pendingRequests`, `canManage`).

## Layout — `app/layout/AppLayout.tsx`
- **Purpose:** topbar (search, notifications stub, theme, sign-out) + sidebar/bottom-nav (from enabled features).
- **Components:** `Header`, `Sidebar`.
- **State:** `useAuth`, `useTheme`, `useSidebar` (nav built from features).
