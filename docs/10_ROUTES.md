# 10 — Routes

> Every route in `apps/web`, with component, protection, permissions/role, status, and
> navigation source.

Route constants live in `packages/core/src/routing/routes.ts` (`ROUTES`). The router is
defined in `apps/web/src/app/routes/index.tsx`.

**Status:** ✅ Implemented · 🚧 Placeholder · 🔶 Prototype

---

## 1. Route Map

```mermaid
graph TD
    ROOT[/] --> RR[RootRedirect]
    LOGIN[/login] --> LR[PublicRoute + LoginPage]
    SIGNUP[/signup] --> SR[PublicRoute + SignUpPage]
    RESET[/reset-password] --> RP[PublicRoute + ResetPasswordPage]
    ONB[/onboarding] --> ON[OnboardingPage]
    PA[/pending-approval] --> PAG[PendingApprovalPage]
    PROT[ProtectedLayout] --> HOME[/home]
    PROT --> PH1[/market/food]
    PROT --> PH2[/market/shop]
    PROT --> PH3[/projects*]
    PROT --> PH4[/connect*]
    PROT --> PH5[/hostel]
    PROT --> PH6[/profile, /profile/settings]
    PROT --> ADMIN[/admin, /admin/requests, /admin/requests/:id]
    STAR[*] --> NF[NotFoundPage]
```

---

## 2. Route Table

| Route | Component | Protection | Permissions / Role | Status | Navigation source |
|-------|-----------|------------|--------------------|--------|-------------------|
| `/` | `RootRedirect` | none (redirects by state) | — | ✅ | manual / URL |
| `/login` | `LoginPage` | `PublicRoute` (anonymous only) | — | ✅ | app state redirect |
| `/signup` | `SignUpPage` | `PublicRoute` | — | ✅ | link from login |
| `/reset-password` | `ResetPasswordPage` | `PublicRoute` | — | ✅ | link from login |
| `/onboarding` | `OnboardingPage` | none (guarded by state internally) | must be authenticated + no role | ✅ | state redirect |
| `/pending-approval` | `PendingApprovalPage` | none (state-guarded) | pending request | ✅ | state redirect |
| `/home` | `FeedPage` | `ProtectedLayout` | ready + feed feature | ✅ | featured nav / redirect |
| `/market/food` | `PlaceholderPage` (Food Delivery) | `ProtectedLayout` | ready | 🚧 | featured nav |
| `/market/shop` | `PlaceholderPage` (Marketplace) | `ProtectedLayout` | ready | 🚧 | featured nav |
| `/projects` | `PlaceholderPage` (Projects) | `ProtectedLayout` | ready | 🚧 | featured nav |
| `/projects/mine` | `PlaceholderPage` (My Projects) | `ProtectedLayout` | ready | 🚧 | featured nav |
| `/projects/crowdfund` | `PlaceholderPage` (Crowdfunding) | `ProtectedLayout` | ready | 🚧 | featured nav |
| `/connect/alumni` | `PlaceholderPage` (Alumni) | `ProtectedLayout` | ready | 🚧 | featured nav |
| `/connect/students` | `PlaceholderPage` (Students) | `ProtectedLayout` | ready | 🚧 | featured nav |
| `/connect/faculty` | `PlaceholderPage` (Faculty) | `ProtectedLayout` | ready | 🚧 | featured nav |
| `/connect/jobs` | `PlaceholderPage` (Jobs) | `ProtectedLayout` | ready | 🚧 | featured nav |
| `/connect/events` | `PlaceholderPage` (Events) | `ProtectedLayout` | ready | 🚧 | featured nav |
| `/hostel` | `PlaceholderPage` (Hostel) | `ProtectedLayout` | ready | 🚧 | featured nav |
| `/profile` | `PlaceholderPage` (Profile) | `ProtectedLayout` | ready | 🚧 | featured nav / bottom nav |
| `/profile/settings` | `PlaceholderPage` (Settings) | `ProtectedLayout` | ready | 🚧 | featured nav |
| `/admin` | `AdminRequestsPage` | `ProtectedLayout` + `canManage` | `rbac.manage` | ✅ | featured nav (admin feature) |
| `/admin/requests` | `AdminRequestsPage` | `ProtectedLayout` + `canManage` | `rbac.manage` | ✅ | /admin → link |
| `/admin/requests/:requestId` | `AdminRequestDetailPage` | `ProtectedLayout` + `canManage` | `rbac.manage` | ✅ | AdminRequestsPage → Review |
| `*` | `NotFoundPage` | none | — | ✅ | any unknown URL |

---

## 3. Protection Details

- **`ProtectedLayout`** (`routes/guards.tsx`): shows spinner while loading; redirects
  anonymous → `/login`, onboarding → `/onboarding`, pending → `/pending-approval`; otherwise
  renders `<AppLayout><Outlet/></AppLayout>`.
- **`PublicRoute`**: shows children only when anonymous; otherwise redirects by stage.
- **`RootRedirect`**: `/` redirects by `useUserApplicationState`.
- **`FeatureRoute` / `PermissionRoute`**: implemented but **not attached to any route**
  (route-level feature/permission gating not yet wired).
- **Admin pages** additionally gate on `canManage` (`rbac.manage`).

---

## 4. Permissions / Required Role Notes

- The only route currently enforcing a permission beyond authentication is the **admin**
  set, which requires the `rbac.manage` permission (granted to `super_admin` and
  `campus_admin` via seed `role_permissions.sql`).
- All featured routes effectively require a role (i.e. the user reached the `ready`
  stage), because `ProtectedLayout` only renders after a role is granted.
- The **nav items** (sidebar/bottom) are filtered by **enabled features** via
  `AuthorizationProvider` — so a placeholder route may still not appear in navigation for
  roles without that feature.

---

## 5. Navigation Sources

- **Sidebar / bottom nav:** `NavigationProvider` → `buildNavigation(features)` — uses
  `feature_registry.route` + `sort_order`.
- **Legacy `BOTTOM_NAV_ITEMS`** (`core/routes.ts`) with `requiredCapability` is **not**
  consumed by the active `AppLayout` (it is only used by the legacy `MainLayout`).
- Pages link to each other via `ROUTES` constants (e.g. login ↔ signup, admin list ↔
  detail).

---

## 6. Cross-references

- Guards: [`05_FRONTEND.md`](./05_FRONTEND.md) §10
- Route constants: `packages/core/src/routing/routes.ts`
- Auth state routing: [`07_AUTHENTICATION.md`](./07_AUTHENTICATION.md) §12–13
