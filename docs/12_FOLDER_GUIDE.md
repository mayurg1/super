# 12 — Folder Guide

> What every important folder in the repository is for.

---

## 1. Repository Root

| Path | Purpose |
|------|---------|
| `package.json` | Root scripts (`dev`, `build`, `typecheck`, `lint`, `format`) + engines + package manager (`pnpm@9.15.0`) |
| `pnpm-workspace.yaml` | Workspace globs: `apps/*`, `packages/*`, `services/*`, `tooling/*` |
| `pnpm-lock.yaml` | Lockfile |
| `eslint.config.js` | Flat ESLint 9 config (react-hooks, react-refresh, typescript-eslint) |
| `.prettierrc` / `.prettierignore` | Prettier (semi, single quote, printWidth 100) |
| `.gitignore` | Ignores `node_modules`, `dist`, `.env*` (except `.env.example`), etc. |
| `README.md` | High-level project readme (Phase 3 framing) |
| `docs/` | **This** documentation set |
| `chrome_err.log`, `dom.html` | Stray debugging artifacts (not part of the app) |

---

## 2. `apps/`

| Path | Purpose |
|------|---------|
| `apps/web/` | The PWA client (the only application). |

Key files under `apps/web/`:
- `package.json` — Vite/React deps + `workspace:*` package deps.
- `vite.config.ts` — Vite config (react plugin, `@` alias, env prefixes, port 5173).
- `tsconfig.json` — extends `tooling/tsconfig/react.json`; project references to packages.
- `index.html` — HTML shell (fonts, theme-color, `#root`).
- `public/manifest.webmanifest` — PWA manifest (icons empty).
- `src/main.tsx` — entry.
- `src/app/` — application code (routes, providers, layout, pages, features).
- `src/styles/global.css` — global styles + design-token import.
- `src/vite-env.d.ts` — env typings.

---

## 3. `packages/` (shared libraries)

| Path | Purpose |
|------|---------|
| `packages/contracts/` | Framework-agnostic contracts: errors (`ErrorCode`, envelopes), events (`PlatformEventMap`), permissions/capabilities, DTOs |
| `packages/core/` | Framework-agnostic infra: config/env, auth port & session store, event bus, logger, AppError, routing constants, permission evaluator |
| `packages/shared/` | Design system: theme (`ThemeProvider`), UI primitives (`Button`, `Input`, `Card`, `Spinner`, `EmptyState`), `cn` util |
| `packages/api-client/` | Typed HTTP client for the future BFF (REST envelope handling) |
| `packages/supabase/` | Typed Supabase integration: client, provider, service façades, React providers, server-only client |

Each package: `package.json` (private, ESM, `workspace:*` deps), `tsconfig.json`, `src/`,
generated `dist/`.

---

## 4. `supabase/`

| Path | Purpose |
|------|---------|
| `supabase/migrations/` | **Sole source of truth** for schema, RLS, functions, triggers, storage buckets (0001–0024) |
| `supabase/seed/` | Idempotent seed data (campuses, departments, programs, roles, permissions, features, roles→permissions/features, demo admin user, verify) |
| `supabase/config.toml` | Local Supabase config (project_id `supercampus`, Postgres 17) |
| `supabase/.temp/linked-project.json` | CLI link metadata (`sgqgapthhknhmtnwwlrp`) |
| `supabase/README.md` | Migration-first workflow instructions |

---

## 5. `server/`

- **Does not exist yet.** The workspace glob includes `services/*` but no
  `server/` or `services/` folder is present. A future BFF would live under `services/`
  (or `server/`). The `@supercampus/api-client` already targets it.

---

## 6. `scripts/`

- **Does not exist yet.** Root scripts are defined in `package.json`; there is no
  `scripts/` folder.

---

## 7. `public/`

- `apps/web/public/manifest.webmanifest` — PWA manifest (icons empty; no static assets yet).

---

## 8. `tooling/`

| Path | Purpose |
|------|---------|
| `tooling/tsconfig/base.json` | Shared strict TS options |
| `tooling/tsconfig/react.json` | React (DOM) TS config (extends base) |
| `tooling/tsconfig/node.json` | Node TS config (extends base) |

Consumed via `extends` from each package/app `tsconfig.json`.

---

## 9. `src/` (repository root) — ⚠️ Legacy

| Path | Purpose |
|------|---------|
| `src/core/event-bus.js` | Legacy event bus (JS) from `superold` |
| `src/features/widgets/` | Legacy external-API widgets (weather/quote/joke/news) in plain JS |
| `src/shared/dom/` | Legacy DOM helpers |

These are **not imported by the current app** (ESLint ignores `src/**`, and `apps/web`
imports only `packages/*`). They are a partial `superold` migration. See
[`14_TODO.md`](./14_TODO.md) and [`16_CLAUDE.md`](./16_CLAUDE.md).

---

## 10. `docs/`

- Curated documentation set (this folder). `docs/features/widgets-behaviour.md` documents
  the legacy widget behaviour.

---

## 11. Generated / Ignored

`node_modules/`, `**/dist/`, `.turbo/`, `.env*` (except `.env.example`), `coverage/`,
`.vite/`, `*.log` — ignored by git.

---

## 12. Cross-references

- Package ownership: [`16_CLAUDE.md`](./16_CLAUDE.md) §Folder Ownership
- Developer commands: [`13_DEVELOPER_GUIDE.md`](./13_DEVELOPER_GUIDE.md)
