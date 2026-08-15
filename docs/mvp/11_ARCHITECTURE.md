# 11 — Architecture

## Target (simplified) flow
```
Supabase Auth
   ↓
ProtectedRoute (auth + role gate)
   ↓
AppLayout (Header/Sidebar + Outlet)
   ↓
Pages (Feed / Marketplace / Food / Dashboard / Onboarding / Admin…)
   ↓
Service façades (createFeedService / createMarketplaceService / createFoodService / …)
   ↓
Typed Supabase client
   ↓
Database (Postgres + RLS)
```

## Current dependency flow (what exists today)
```
main.tsx → App → AppProviders
 (QueryClient → Supabase → Auth → Profile → Authorization → RoleRequests → Application → Navigation → Dashboard → Platform → Theme)
→ ApplicationRouter → RouterProvider(appRouter) → ProtectedLayout → AppLayout → Outlet → Page
→ Service façade (packages/supabase) → client.from('table') → RLS
```

## Provider roles
- `SupabaseProvider` — shared typed client.
- `AuthProvider` — session/user.
- `ProfileProvider` — current profile.
- `AuthorizationProvider` — roles/permissions/features snapshot (client mirror of RLS; UX only).
- `RoleRequestsProvider` — role requests + admin approval.
- `ApplicationProvider` — aggregates bootstrap (loading/ready/error).
- `NavigationProvider`/`DashboardProvider` — derive nav/dashboard from features.
- Feature providers (`Feed/Marketplace/Food`) — per-feature data + optimistic state + realtime.

## Security model
DB-authoritative RLS (`has_permission`/`has_feature`). Client authorization is a UX mirror only.

## The clean-architecture decision (see risk note, 13_TODO / STEP‑3)
Moving to "explicit role checks only" means replacing, not just deleting, the authorization layer:
nav and dashboard derive from enabled features; admin approval uses `rbac.manage`; RLS still needs a
campus-scoped role signal. Deletion without a replacement removes working features.
