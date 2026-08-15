# 05 — Routes

Router: `apps/web/src/app/routes/index.tsx` (single `createBrowserRouter`).
Guards: `routes/guards.tsx` (`ProtectedLayout`, `PublicRoute`, `FeatureRoute`/`PermissionRoute`).
Path constants: `packages/core/src/routing/routes.ts` (`ROUTES`).

| Path | Page | Auth | Role required | Purpose |
|---|---|---|---|---|
| `/` | RootRedirect | — | — | redirect by app stage |
| `/login` | LoginPage | anon | — | sign in |
| `/signup` | SignUpPage | anon | — | create account |
| `/reset-password` | ResetPasswordPage | anon | — | reset password |
| `/onboarding` | OnboardingPage | auth | none | profile + role request |
| `/pending-approval` | PendingApprovalPage | auth | none | awaiting admin approval |
| `/home` | FeedPage | auth | none (ungated landing) | campus feed |
| `/dashboard` | DashboardPage | auth | feature `dashboard` | dashboard home variant |
| `/market/shop` | MarketplacePage | auth | feature `marketplace` | buy/sell marketplace |
| `/market/shop/:productId` | ProductDetailPage | auth | feature `marketplace` | product detail |
| `/market/food` | FoodPage | auth | feature `food_delivery` | food ordering |
| `/projects` (+`/mine`,`/crowdfund`) | Placeholder | auth | projects/crowdfunding | future |
| `/connect/alumni` `/students` `/faculty` | Placeholder | auth | directory | future |
| `/connect/jobs` | Placeholder | auth | jobs | future |
| `/connect/events` | Placeholder | auth | events | future |
| `/hostel` | Placeholder | auth | hostel | future |
| `/profile` | Placeholder | auth | profile | future |
| `/profile/settings` | Placeholder | auth | settings | future |
| `/admin`, `/admin/requests`, `/admin/requests/:requestId` | AdminRequestsPage / Detail | auth | `rbac.manage` | role-request review |
| `*` | NotFoundPage | — | — | 404 |

> Note: `/home` is intentionally ungated (universal redirect target). Feature-gated routes use
> `FeatureRoute`; admin routes use `PermissionRoute` (`rbac.manage`).
