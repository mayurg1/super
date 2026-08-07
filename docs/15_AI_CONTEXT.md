# 15 — AI Context

> **Read me first.** A dense orientation so any AI assistant can understand SUPERCAMPUS in
> under 5 minutes before touching code.

---

## 1. Project Summary (60-second)

**SUPERCAMPUS (supernew)** is a greenfield, migration-first **campus "super app"** built as
a **pnpm monorepo**. It is a **React 19 SPA** (`apps/web`) that talks **directly to
Supabase** (Postgres + RLS + Auth + Storage + Realtime). There is **no self-hosted
server** yet.

**Currently implemented:** auth, profile bootstrap, RBAC/feature authorization, onboarding,
role requests + admin approval, and a working **feed** (posts/likes/comments/pagination).

**Not implemented:** marketplace, projects, events, jobs, hostel, food, chat, notifications,
directory, analytics (all have **DB schema** but only placeholder routes).

**Do not confuse:** this repo is unrelated to a legacy `superold` app; a leftover `src/`
folder at the root is an unused partial migration.

---

## 2. Architecture (installed mental model)

```mermaid
graph TD
    WEB[apps/web (React 19 + Vite)] -->|typed client + façades| SB[Supabase]
    SB --> AUTH[Auth/JWT]
    SB --> PG[Postgres 17 + RLS]
    SB --> STO[Storage]
    SB --> RT[Realtime]
    WEB -.-> AC[api-client (unused, no BFF)]
```

- **Security** is enforced **in the database** via RLS policies calling
  `has_permission(...)` / `has_feature(...)`. Client `hasPermission` is UX only.
- **Data flow:** Component → Provider hook (`useX`) → service façade
  (`createXService`) → typed Supabase client → rows → normalized → `{data, error}` result.

---

## 3. Folder Map

```text
apps/web/                  # the app (Vite/React)
packages/contracts/        # shared errors, events, permissions, DTOs
packages/core/             # config, event bus, logger, AppError, route consts, legacy auth stubs
packages/shared/           # theme + UI primitives (Button/Input/Card/Spinner/EmptyState)
packages/api-client/       # HTTP client for the future BFF (unused)
packages/supabase/         # Supabase client + providers + service façades  ← MOST IMPACT
supabase/migrations/       # 0001–0024: ALL schema/RLS/functions/storage  ← DB TRUTH
supabase/seed/             # idempotent seed (roles, permissions, features, demo admin)
tooling/tsconfig/          # shared TS configs
src/                       # ⚠️ LEGACY JS (superold) — do NOT touch/import
docs/                      # this documentation
```

---

## 4. Important Files (why they matter)

| File | Why |
|------|-----|
| `packages/supabase/src/database.types.ts` | Generated `Database` type — every table/column contract |
| `packages/supabase/src/index.ts` | Package public API (services + providers) |
| `packages/supabase/src/service*.ts` (auth/profile/authorization/feed/roleRequests) | All database access façades |
| `packages/supabase/src/*Provider.tsx` | Context providers (auth/profile/authz/roleRequests) |
| `apps/web/src/app/providers/AppProviders.tsx` | Provider tree + platform bootstrap |
| `apps/web/src/app/providers/useUserApplicationState.ts` | The app-stage state machine |
| `apps/web/src/app/routes/index.tsx` + `guards.tsx` | Routing + guards |
| `supabase/migrations/*.sql` | Schema/RLS (read before any DB change) |
| `supabase/seed/*.sql` | RBAC seed (roles/permissions/features) |
| `packages/core/src/routing/routes.ts` | Canonical `ROUTES` constants |

---

## 5. Coding Conventions

- **TypeScript strict** everywhere; ESM; `.tsx` for JSX, `.ts` otherwise.
- **React:** function components + hooks; providers own state; contexts expose `useX()`.
- **Services:** `createXService(client)` returning a plain object of async methods; every
  method returns `{ data: T | null; error: string | null }`.
- **Result type naming:** `XxxResult<T>` / `XxxContextValue` / `XxxService`.
- **DB access:** always through the typed client + a service façade; **never `any`**.
- **Prettier:** semi, single quotes, trailing commas, printWidth 100, tab 2.
- **CSS:** `sc-` prefixed classes, design tokens in `packages/shared/src/theme/tokens.css`.
- **Env:** `VITE_*`/`NEXT_PUBLIC_*` browser-safe names; see `supabase/src/env.ts`.

---

## 6. Business Rules (non-negotiable)

1. **New users:** sign up → profile auto-created by DB trigger → onboarding → they
   **request a role** → admin approves/rejects → only then do they get the app.
2. **Access requires a granted role** (`user_roles`). Stage machine: `loading →
   anonymous → onboarding → pending → ready`.
3. **Permissions** are `module.key` strings granted to roles; enforced by RLS via
   `has_permission`.
4. **Features** are registry entries granted to roles; drive nav + gating via
   `has_feature`.
5. **Feed visibility:** `can_read_post` (published + non-deleted + private/campus/public
   rules); soft-delete via `status='removed'` + `deleted_at`.
6. **Supabase env missing** → app still mounts to Login (auth disabled) — never throw at
   bootstrap.
7. **Storage buckets are private**; object paths are namespaced by `auth.uid()`.

---

## 7. Authentication & Authorization (rules to follow)

- **Auth = Supabase Auth** (`AuthProvider` listens to `onAuthStateChange`). Do **not** build
  a custom auth stack. `@supercampus/core`'s auth stubs are legacy — ignore them.
- **Authorize via the snapshot** from `useAuthorization()` (`roles`, `permissions`,
  `features`). Use `hasPermission` / `hasFeature` / `hasRole` for UI gating.
- **Never trust client checks for security** — always add RLS when data is read/written.
- **Role changes** happen through `user_roles`; approvals through `role_requests`.

---

## 8. Providers, Routing & State

- **Provider order is fixed** in `AppProviders.tsx` — new providers that depend on auth/
  profile must be placed after them.
- Routing is declarative in `routes/index.tsx`; guards in `guards.tsx`. Use `ROUTES`
  constants (never hardcode paths in `apps/web`).
- **State:** React context owns domain state; `QueryClient` exists for server cache;
  `FeedProvider` does optimistic updates. No Redux/Zustand at runtime.

---

## 9. Database Overview

- **~70 public tables**, Postgres 17, `citext` codes/handles/keys, `gen_random_uuid()` IDs,
  `timezone('utc', now())` timestamps, `set_updated_at()` trigger, `deleted_at` soft
  deletes.
- **RBAC:** `roles`, `permissions`, `role_permissions`, `user_roles`, `feature_registry`,
  `role_features`.
- **Approval:** `role_requests`.
- **Feed:** `posts`, `post_media`, `post_comments`, `post_likes`, (+ polls/stories schema).
- **Everything else** (marketplace/projects/events/jobs/hostel/food/chat/notifications/
  analytics/moderation) is schema-only.
- **Seed** defines 8 roles, ~35 permissions, 16 features; `super_admin` = all.

---

## 10. Naming Conventions

- **Tables/packages/files:** snake_case for DB; camelCase for TS; PascalCase components.
- **Queries/columns:** `id`, `user_id`, `created_at`, `updated_at`, `*_at`, `is_*`,
  `status`, `visibility`.
- **Result types:** `XxxResult<T>`; **services:** `createXService`; **providers:**
  `XProvider` + `useX`; **contexts:** `XContext`; **context value:** `XContextValue`.
- **Route constants:** `ROUTES.<name>` in `core/routing/routes.ts`.

---

## 11. Current Implementation Status (module → classification)

| Module | Classification |
|--------|----------------|
| Auth / session | Production Ready (Supabase-backed) |
| Profile bootstrap | Production Ready |
| RBAC + features (client + RLS) | Production Ready |
| Onboarding | Mostly Complete |
| Role Requests / Pending Approval | Mostly Complete |
| Admin role-request review | Mostly Complete |
| Feed (text/likes/comments/pagination) | Mostly Complete |
| Feed media/polls/stories | Partial (schema) |
| Dashboard | Prototype |
| Profile/Settings pages | Placeholder |
| Marketplace/Projects/Events/Jobs/Hostel/Food/Directory | Placeholder (schema-only) |
| Messaging / Notifications / Analytics | Placeholder (schema + realtime pub) |
| BFF / API server | Not built |

---

## 12. How New Features Should Be Implemented

Follow the **existing pattern** (see Feed as the reference):

1. **Schema/RLS first** — add/extend a migration under `supabase/migrations/`; re-run
   `supabase gen types` and update `database.types.ts`.
2. **Service façade** — add `createXService(client)` in `packages/supabase/src/` and export
   it from `index.ts`.
3. **Provider + hook** — add `XProvider` + `useX` (place in the provider tree in
   `AppProviders.tsx` if global).
4. **Route + page** — register in `routes/index.tsx` with a `ROUTES` constant; replace the
   `PlaceholderPage`.
5. **Components** — build UI using `@supercampus/shared` primitives and `sc-*` CSS classes.
6. **Feature registration** — ensure `feature_registry`/`role_features` (seed) includes it
   so nav/gating works.

---

## 13. What NOT To Change / Touch

- **`database.types.ts`** — regenerate, don't hand-edit.
- **RLS policies / `has_permission` / `has_feature`** — changing these changes security;
   only via migration with review.
- **Provider hierarchy + guard redirect logic** — widely depended on; change with care.
- **Legacy root `src/`** — not wired into the app; leave it or delete deliberately.
- **`@supercampus/core` auth/routing stubs & `api-client`** — legacy/unused; don't build on
   them unless the BFF arrives.

---

## 14. Common Pitfalls (avoid)

- Importing **`@supercampus/supabase/server`** into browser code (leaks service key).
- Calling `client.from('table')` without a **service façade** (breaks the pattern).
- Hardcoding **route strings** instead of `ROUTES`.
- Skipping RLS on a new read/write (client-only checks are not security).
- Editing `database.types.ts` by hand.
- Adding state to the wrong place (use the provider that owns that domain).
- Assuming features like Marketplace have a UI (they don't — check `PlaceholderPage`).
- Trusting `README.md` "Phase 3 only" — it lags the actual code (feed/admin exist).

---

## 15. Quick Start Checklist for a Task

1. Find the domain's `createXService` + provider (or create them).
2. Check the migration + `database.types.ts` for available columns.
3. Mirror an existing implemented flow (Feed or RoleRequests) for structure.
4. Add RLS if touching the DB.
5. Wire UI via a page folder under `apps/web/src/app/`.
6. Run `pnpm typecheck` + `pnpm lint` before finishing.

