# SUPERCAMPUS (supernew)

Greenfield rebuild of the SUPERCAMPUS campus platform.

## Phase 3 — Platform foundation only

This repository contains the **platform shell** — no product features yet.

### Packages

| Package | Purpose |
|---------|---------|
| `@supercampus/contracts` | Shared DTOs, errors, events, permissions |
| `@supercampus/core` | Auth, config, event bus, logging, routing |
| `@supercampus/shared` | Design system, theme, UI primitives |
| `@supercampus/api-client` | Typed HTTP client |
| `@supercampus/supabase` | Typed Supabase client, provider, and service façades |
| `@supercampus/web` | PWA client application |

### Commands

```bash
pnpm install
pnpm dev          # Start web dev server
pnpm build        # Build all packages
pnpm typecheck    # TypeScript check all packages
pnpm lint         # ESLint
pnpm format       # Prettier
```

### Environment

The web client validates public Supabase settings at startup. It supports the existing
`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` names, as well as
the Vite-native `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` names. Do not expose
database passwords, service-role keys, or access tokens to the browser.
