# CLAUDE.md — SUPERCAMPUS

> **For AI coding assistants** (Cline, Claude Code, Cursor, Roo, Windsurf, ChatGPT,
> Gemini). Read this before writing code. Companion docs live in `docs/` (this file is the
> condensed version; see `docs/15_AI_CONTEXT.md` for the full AI context).

---

## Project Identity

- **Name:** SUPERCAMPUS (repo: `supernewcopy`; package namespace `@supercampus/*`).
- **Purpose:** a greenfield campus "super app" (feed, marketplace, projects, events, jobs,
  hostel, food, chat, directory, notifications, admin).
- **Status:** foundation + auth/RBAC + onboarding/role-requests + **feed** are implemented;
  the rest are schema-only placeholders. **No backend server** yet.
- **High-level architecture:** a single **React 19 SPA** (`apps/web`) talks **directly to
  Supabase** (Postgres 17 + RLS + Auth + Storage + Realtime). Security is enforced in the
  **database** via RLS. Everything lives in a **pnpm monorepo**.

---

## Tech Stack

| Area | Choice |
|------|--------|
| Frontend | React 19, Vite 6, React Router 7, @tanstack/react-query |
| Language | TypeScript 5.8 (`strict`), ESM |
| Backend / DB | Supabase (Postgres 17, RLS, PostgREST) |
| Auth | Supabase Auth (JWT, email/password) |
| Storage | Supabase Storage (private buckets) |
| Realtime | Supabase Realtime (publication only, unused) |
| Validation | Zod (env schemas) |
| Styling | CSS + design tokens (`sc-*` classes) |
| Monorepo / PM | pnpm 9 (workspaces) |
| Quality | ESLint 9 (flat), Prettier, `tsc --noEmit` |

---

## Folder Ownership

| Folder | Responsibility |
|--------|----------------|
| `apps/web/` | The application (routes, providers, layout, pages, feature UI) |
| `packages/contracts/` | Shared errors/envelopes, platform events, capability types, DTOs |
| `packages/core/` | Env/config, event bus, logger, `AppError`, route constants, **legacy auth stubs** |
| `packages/shared/` | Theme + UI primitives (`Button`, `Input`, `Card`, `Spinner`, `EmptyState`) |
| `packages/api-client/` | HTTP client for a **future BFF** (currently unused) |
| `packages/supabase/` | Typed Supabase client, providers, **service façades** (core data layer) |
| `supabase/` | `/migrations` (schema+RLS truth 0001–0024), `/seed` (idempotent fixtures), `config.toml` |
| `docs/` | Documentation (this file is `docs/CLAUDE.md`) |
| `scripts/` | **Does not exist** — root scripts live in `package.json` |
| `public/` | `apps/web/public/manifest.webmanifest` (PWA manifest, icons empty) |
| `src/` (root) | **LEGACY** superold JS migration — do not import or build on |

> `services/` is declared in `pnpm-workspace.yaml` but **does not exist** (future BFF).

---

## Architecture Rules

### Authentication flow
Supabase Auth only. `AuthProvider` (`packages/supabase/src/authProvider.tsx`) subscribes to
`onAuthStateChange` and exposes `user/session/loading/authenticated` + an auth service. Do
**not** build a custom auth stack; ignore `@supercampus/core`'s auth stubs.

### Authorization flow
`AuthorizationProvider` builds a snapshot (`roles`, `permissions`, `features`) from
`user_roles` → `role_permissions`/`role_features` (+ `feature_registry`). Use
`hasPermission`/`hasFeature`/`hasRole` for **UI gating**; the DB is authoritative via RLS
functions `has_permission(text, campus?)` / `has_feature(text, campus?)`.

### Routing
Declarative `createBrowserRouter` in `apps/web/src/app/routes/index.tsx`; guards in
`guards.tsx` (`ProtectedLayout`, `PublicRoute`, `RootRedirect`). **Always** use `ROUTES`
constants from `packages/core/src/routing/routes.ts`, never hardcoded paths.

### Providers & context hierarchy
Fixed order in `AppProviders.tsx`:
`QueryClient → Supabase → Auth → Profile → Authorization → RoleRequests → Application →
Navigation → Dashboard → Platform → Theme`. Add dependent providers **after** their
dependencies.

### State management
React Context owns domain state; each provider exposes `useX()`. `FeedProvider` does
optimistic updates. `QueryClient` exists for server cache but most reads go straight through
providers to Supabase. No Redux/Zustand at runtime (core's Zustand store is legacy).

### API structure
All DB access goes through **service façades** `createXService(client)` in
`packages/supabase/src/`, exported from `index.ts`. Every method returns
`{ data: T | null; error: string | null }` (types: `XxxResult<T>`). Components call
providers, never the raw client directly.

### Database architecture
`supabase/migrations/` is the **sole source of truth** (schema + RLS + functions + storage
buckets). ~70 public tables; `citext` codes/handles/keys; `gen_random_uuid()` IDs;
`timezone('utc', now())`; `set_updated_at()` trigger; `deleted_at` soft deletes. Regenerate
`packages/supabase/src/database.types.ts` after schema changes — **never hand-edit it**.

---

## Coding Standards

- **File naming:** `PascalCase.tsx` components; `camelCase.ts` for non-JSX (services,
  builders, contexts); snake_case for DB.
- **Component structure:** function component + hooks; props typed via exported interfaces;
  small presentational + container split.
- **Hook conventions:** `useX()` from a context, throws if used outside provider; derived
  helper hooks exported from the provider (e.g. `useRoles`, `useHasPermission`).
- **Service conventions:** `createXService(client)` factory returning async methods.
- **TypeScript:** `strict`; avoid `any`; use `Database`/`Tables<'name'>` types from
  `@supercampus/supabase`; ESM imports with `.js` extensions in package source.
- **Error handling:** services return `{data, error}` with friendly messages; components
  render `error`; `AppError`/`ErrorCode` for BFF path (unused).
- **Logging:** `@supercampus/core` `logger` or `console.*`; never log tokens/keys.
- **Folder organization:** features live under `apps/web/src/app/<feature>/` with
  `<Feature>Page`, `<Feature>Provider`, context, and components together.

---

## Development Rules (hard)

- **Never change the database schema** unless explicitly requested — and if you do, add a
  migration + regen types.
- **Never rename existing APIs** without updating all callers (search first).
- **Prefer extending existing services** over creating duplicate façades.
- **Reuse shared components** (`@supercampus/shared`) and existing providers.
- **Follow existing architecture** (provider + service + façade + RLS) — don't introduce a
  new paradigm for one feature.
- **Preserve backward compatibility** with `database.types.ts`, `ROUTES`, and provider order.
- **Never import `@supercampus/supabase/server` into browser code** (service-role key).
- Run `pnpm typecheck` and `pnpm lint` before finishing.

---

## Business Rules

- **Onboarding:** new user → profile auto-created → onboarding wizard → **requests a role**
  → admin approves → access granted.
- **Role requests:** `role_requests` (pending/approved/rejected); approval upserts
  `user_roles` for that user+campus+role.
- **Role approval:** requires the `rbac.manage` permission; done in admin pages.
- **Campus permissions:** roles are campus-scoped; RLS checks `*_campus_id` via
  `current_campus_id()`/`has_permission(..., campus_id)`.
- **Authorization:** DB is authoritative (RLS); client mirrors for UX.
- **Feed:** visible via `can_read_post`; publish requires `posts.create`; soft delete via
  `status='removed'` + `deleted_at` (owns) or `posts.moderate`.

---

## AI Working Rules

1. **Understand first** — read the relevant service/provider/migration before editing.
2. **Search for similar implementations** before creating new code (mirror Feed or
   RoleRequests).
3. **Avoid duplicate** components, services, providers, and API façades.
4. **Keep changes minimal** and incremental.
5. **Explain architectural impact** before proposing major refactors.
6. **Don't invent** features — if a domain has no UI, say so.

---

## Known Technical Debt

- Legacy root `src/` (superold JS widgets/event bus) — unused, not wired.
- `@supercampus/core` auth/routing stubs + `contracts` capabilities/DTOs — legacy/unused.
- `@supercampus/api-client` — dead code (no BFF).
- `DashboardPage` unregistered; `MainLayout` unused.
- No tests, no CI, no `.env.example`; `manifest` icons empty.
- Stray `chrome_err.log` / `dom.html` at repo root.

---

## Current Feature Status

| Module | Status |
|--------|--------|
| Auth, Profile bootstrap, RBAC+features | Production Ready |
| Onboarding, Role Requests, Pending Approval, Admin review | Mostly Complete |
| Feed (text/likes/comments/pagination) | Mostly Complete |
| Feed media/polls/stories | Partial (schema only) |
| Dashboard | Prototype |
| Profile/Settings pages | Placeholder |
| Marketplace, Projects, Events, Jobs, Hostel, Food, Directory | Placeholder (schema only) |
| Messaging, Notifications, Analytics | Placeholder (schema + realtime pub) |
| BFF / API server | Not built |

---

## Important Files

| File | Why |
|------|-----|
| `packages/supabase/src/database.types.ts` | Generated DB types (all tables) |
| `packages/supabase/src/index.ts` | Public API of the data layer |
| `packages/supabase/src/*.ts` (auth/profile/authorization/feed/roleRequests + providers) | All data logic |
| `apps/web/src/app/providers/AppProviders.tsx` | Provider tree + platform bootstrap |
| `apps/web/src/app/providers/useUserApplicationState.ts` | App-stage state machine |
| `apps/web/src/app/routes/index.tsx`, `guards.tsx` | Routing + guards |
| `apps/web/src/app/feed/FeedProvider.tsx`, `feed.ts` | **Reference feature implementation** |
| `supabase/migrations/*.sql` | Schema + RLS (read before DB work) |
| `supabase/seed/*.sql` | RBAC seed (roles/permissions/features) |
| `packages/core/src/routing/routes.ts` | Canonical `ROUTES` |

---

## Common Pitfalls

- Importing `@supercampus/supabase/server` into the browser (secret leak).
- Querying `client.from(...)` outside a service façade.
- Hardcoding path strings instead of `ROUTES`.
- Skipping RLS on a new table/query.
- Editing `database.types.ts` by hand instead of regenerating.
- Misplacing state (use the owning provider).
- Assuming schema-only domains have a UI.
- Trusting `README.md` "Phase 3 only" (it lags the code).
- Breaking provider order or guard redirect logic (very dependent).

---

## Quick Start (mental model, <5 min)

1. **Data layer** = `packages/supabase` (typed client + service façades + providers). DB
   truth = `supabase/migrations`.
2. **UI layer** = `apps/web` → `AppProviders` → router → pages/features; everything goes
   through provider hooks.
3. **To add a feature:** migration → regen types → `createXService` + export → `XProvider` +
   `useX` → register route (with `ROUTES`) replacing `PlaceholderPage` → UI components →
   seed feature/permission if needed.
4. **To fix something:** find the service/provider/migration, mirror existing patterns,
   never touch `database.types.ts` by hand, and always add/respect RLS.
5. **Verify:** `pnpm typecheck` and `pnpm lint`.

Read `docs/15_AI_CONTEXT.md` and `docs/03_DATABASE.md` before significant work.

