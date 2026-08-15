# 10 — Components

## Shared primitives — `@supercampus/shared` (`packages/shared/src/ui`)
| Component | Props | Used by | Deps |
|---|---|---|---|
| `Button` | `variant`(primary/outline/ghost/secondary/danger), `size`, `fullWidth`, `disabled` | all pages | `cn` |
| `Input` | `label`, `error`, + native input props | login, forms, menu qty | `cn` |
| `Card` | `padding`(sm/md/lg), `className` | all feature cards | `cn` |
| `Spinner` | `label`, `size` | loading states | — |
| `EmptyState` | `icon`, `title`, `description`, `action` | feed/marketplace empty | — |
| `ThemeProvider`/`useTheme` | — | layout/theme toggle | tokens, storage key |

## Layout
- `AppLayout` (`app/layout`) — `Header` + `Sidebar` (bottom nav + desktop), shells page content.
- `MainLayout` — legacy/unused.

## Feed (`app/feed`)
`FeedPage`, `FeedList`, `FeedCard`, `CreatePostCard`, `PostComposer`, `CommentThread`,
`CommentComposer`, `EmptyFeed`, `ErrorState`, `LoadingSkeleton`, `time`.

## Marketplace (`app/marketplace`)
`MarketplacePage`, `CreateProductCard`, `CategoryFilter`, `ProductList`, `ProductCard`,
`ProductDetailPage`, `ProductStatusControl`, `ReportListingButton`.

## Food (`app/food`)
`FoodPage`, `VendorPicker`, `VendorChangeConfirm`, `MenuList`, `MenuItemCard`, `CartPanel`,
`OrderHistory`; hooks `useFoodVendors`, `useFoodMenu`, `useFoodCart`, `useFoodOrders`.

## Pages (`app/pages`)
`LoginPage` (AuthCard + Login/SignUp/ResetPassword), `OnboardingPage`, `PendingApprovalPage`,
`AdminRequestsPage`, `AdminRequestDetailPage`, `NotFoundPage`, `PlaceholderPage`, `ApplicationState`
(loading/error screens).

## Providers (`app/providers` + `@supercampus/supabase`)
`AppProviders`, `ApplicationProvider`, `PlatformContext`, `useUserApplicationState` and
`AuthProvider`, `ProfileProvider`, `AuthorizationProvider`, `RoleRequestsProvider`;
feature-level `FeedProvider`, `MarketplaceProvider`, `FoodProvider`, `DashboardProvider`, `NavigationProvider`.
