# 01 — Project Overview

## Vision
SUPERCAMPUS is a campus "super app": a single React SPA where students, faculty, alumni,
vendors and admin interact through a social feed, a buy/sell marketplace, food delivery,
projects, directory, events and administrative approval.

This is an MVP rebuild: **remove unnecessary architecture while preserving every working
feature**. It is *not* a rewrite — working UI, services, schema and CRUD are reused.

## MVP scope
- Auth (email/password) + session restore
- Onboarding wizard + role request → **admin approval**
- Feed (posts/likes/comments/pagination)
- Marketplace (list/browse/category/favorite/status/report/media)
- Food delivery (vendors/menu/cart/order/history)
- Dashboard home variant
- Shared UI primitives + theme (dark mode)

Out of MVP scope (schema-ready, placeholder UI): Projects, Crowdfunding, Jobs, Events,
Directory/Connect, Hostel, Chat, Notifications, Analytics, Widgets.

## Tech stack
- **Monorepo:** pnpm workspace
- **Frontend:** React 19 + Vite + React Router 7 + TanStack Query
- **Data:** Supabase (Postgres + RLS + Auth + Storage + Realtime)
- **Typed packages:** `contracts`, `core`, `shared`, `api-client`, `supabase`
- **Shared UI:** `@supercampus/shared` (Button/Input/Card/Spinner/EmptyState), design tokens, ThemeProvider

## Folder structure
```
apps/web/src/            React app (routes, providers, layout, pages, features)
packages/contracts/      Errors, events, permissions keys, DTOs
packages/core/           constants (ROUTES), config, logger, events, legacy stubs
packages/shared/         design tokens, theme, UI primitives
packages/supabase/       typed client + service façades + providers
supabase/migrations/     0001–0027 schema + RLS + seed-adjacent backfill
supabase/seed/           roles, permissions, features, role_* grants, demo admin
docs/                    curated docs (+ docs/mvp for this rebuild)
```

## User roles (seeded)
`super_admin`, `campus_admin`, `faculty`, `student`, `alumni`, `vendor`, `hostel_staff`, `moderator`.
Role assignment happens through the role-request/admin-approval flow (`user_roles`).

## High-level architecture
```
React (main.tsx → App) → AppProviders (Query/Supabase/Auth/Profile/Authorization/RoleRequests/…)
 → RouterProvider (createBrowserRouter) → ProtectedLayout
 → AppLayout → Outlet → Page → Service façade → typed Supabase client → Database (RLS)
```
Security is DB-authoritative (RLS + `has_permission`/`has_feature`); client authorization is a UX mirror.
