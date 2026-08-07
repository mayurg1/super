# 13 — Developer Guide

> Installation, commands, env vars, database workflow, and debugging for SUPERCAMPUS.

---

## 1. Prerequisites

- **Node.js ≥ 20** (root `package.json` `engines`).
- **pnpm ≥ 9** (`packageManager: pnpm@9.15.0`). Enable via `corepack enable` if needed.
- **Supabase CLI** for database migrations/seed (links to the hosted project).
- Browser-safe env for the client; **service-role key** only for server-side code (never
  in the browser).

---

## 2. Install

```bash
pnpm install
```

Build depended-on library packages first (or just run the web build, which chains them):

```bash
pnpm --filter @supercampus/contracts build
pnpm --filter @supercampus/core build
pnpm --filter @supercampus/api-client build
pnpm --filter @supercampus/shared build
pnpm --filter @supercampus/supabase build
```

---

## 3. Run (development)

```bash
pnpm dev
```

Starts the Vite dev server for `apps/web` (port **5173**, `open: false`). Needs Supabase
env vars configured (below) or it falls back to placeholders that disable real auth.

---

## 4. Environment Variables

The client accepts Vite-native **or** legacy `NEXT_PUBLIC_` names
(`vite.config.ts` `envPrefix: ['VITE_', 'NEXT_PUBLIC_']`):

| Variable | Purpose | Read in |
|----------|---------|---------|
| `VITE_SUPABASE_URL` (or `NEXT_PUBLIC_SUPABASE_URL`) | Supabase URL | `supabase/src/env.ts` |
| `VITE_SUPABASE_ANON_KEY` (or `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`) | Public anon key | `supabase/src/env.ts` |
| `VITE_APP_ENV` | development \| staging \| production | `core/src/config/env.ts` |
| `VITE_BFF_URL` | Future BFF base (`http://localhost:5500/api/v1`) | `core/src/config/env.ts` |

**Server-only** (never exposed to Vite; for `@supercampus/supabase/server`):

| Variable | Purpose |
|----------|---------|
| `SUPABASE_URL` | Supabase URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Service-role key |

> `loadSupabaseEnv` does **not throw** when settings are missing — it degrades to a local
> placeholder so the app still mounts to Login (auth disabled).

---

## 5. Build

```bash
pnpm build        # build all packages (pnpm -r build)
pnpm --filter @supercampus/web build   # web only (builds its deps too)
```

Web build = build library deps + `tsc --noEmit` + `vite build` (output `dist/`, sourcemaps).

---

## 6. Lint

```bash
pnpm lint          # eslint .
pnpm lint:fix      # eslint . --fix
```

Flat ESLint 9 (`eslint.config.js`). Ignores `dist`, `node_modules`, `build`, `src/**`.

---

## 7. Format

```bash
pnpm format         # prettier --write .
pnpm format:check   # prettier --check .
```

Prettier: semi, single quotes, trailing commas, printWidth 100, tabWidth 2.

---

## 8. Typecheck

```bash
pnpm typecheck
```

Builds `contracts`, `core`, `api-client`, `shared`, `supabase` then `tsc --noEmit` on
`apps/web`. Per-package: `pnpm --filter @supercampus/<pkg> typecheck`.

---

## 9. Database Migrations (Supabase)

Workflow (see `supabase/README.md`):

```bash
supabase login                           # authenticate CLI
supabase link --project-ref sgqgapthhknhmtnwwlrp   # link hosted project
supabase migration new <name>            # create a new migration SQL
# ...edit the generated SQL...
supabase db push                         # apply to hosted project
```

**Rules:**
- Always create schema/storage/RLS changes via **migrations** — never the dashboard.
- After any schema change, **regenerate types**:
  `supabase gen types typescript --project-id <ref> > packages/supabase/src/database.types.ts`
  and commit the updated file.

---

## 10. Seeding

Seed files are version-controlled, idempotent, in `supabase/seed/`. Run in the order in
`bootstrap.sql`: `campuses.sql`, `departments.sql`, `programs.sql`, `roles.sql`,
`permissions.sql`, `features.sql`, `role_permissions.sql`, `role_features.sql`,
`demo_users.sql`, `verify.sql`.

Example (local):
```bash
psql "$SUPABASE_DB_URL" -f supabase/seed/campuses.sql
# ...repeat for each file in order...
```

`demo_users.sql` grants `super_admin` to the email `mayurrh999@gmail.com` (looked up
dynamically).

---

## 11. Deployment

- **Frontend:** `pnpm build`, then host `apps/web/dist` (static host/CDN); set public env
  at build time.
- **Backend:** the only server is **Supabase** — deploy schema via `supabase db push`; seed
  as needed; manage Auth redirect URLs in the dashboard.
- No self-hosted app server exists yet.

---

## 12. Debugging

- **Dev server:** `pnpm dev` (Vite HMR); `console.log`/`debugger` in pages/providers.
- **Supabase errors:** services log detail to console (e.g. `feed.ts deletePost` prints
  code/message/details/hint/status). Check the browser console.
- **Env placeholder:** if auth isn't working, verify `VITE_SUPABASE_*`; a console.warn
  "[supercampus/supabase] Supabase URL/key missing" indicates missing env.
- **RLS:** "no rows"/"permission denied" is almost always an RLS policy (`03_DATABASE.md`
  §21). Reproduce in the Supabase SQL editor with a real user session.
- **Stray artifacts:** `chrome_err.log` / `dom.html` at repo root are debugging leftovers.

---

## 13. Useful Commands Cheat-Sheet

| Task | Command |
|------|---------|
| Install | `pnpm install` |
| Dev server | `pnpm dev` |
| Build all | `pnpm build` |
| Typecheck all | `pnpm typecheck` |
| Lint | `pnpm lint` / `pnpm lint:fix` |
| Format | `pnpm format` / `pnpm format:check` |
| Build one package | `pnpm --filter @supercampus/<pkg> build` |
| New migration | `supabase migration new <name>` |
| Apply migrations | `supabase db push` |
| Regenerate types | `supabase gen types typescript --project-id <ref> > packages/supabase/src/database.types.ts` |
