# 13 — TODO (remaining work after cleanup)

## Safe cleanup (does NOT remove working features)
- Delete stray artifacts: `chrome_err.log`, `dom.html`, `devfinal.log`, `gdev.log`.
- Remove legacy root `src/` (superold JS: event-bus, `features/widgets`, `shared/dom`) once verified
  nothing imports it.
- Remove unused `MainLayout` and legacy `BOTTOM_NAV_ITEMS` if unreferenced.
- Decide/remove unused `@supercampus/api-client` (dead until a BFF) and `@supercampus/core` auth/routing stubs
  (`authProvider`, `authService`, `sessionStore`, routing `guards.ts`/`metadata.ts`).
- Add a test framework + CI; update stale docs (08/14/15 placeholders for Food/Marketplace).

## ⚠️ Higher-risk work — REQUIRES your explicit confirmation
Removing the **authorization/feature/permission layer** (`AuthorizationProvider`, `authorization.ts`,
`FeatureRoute`/`PermissionRoute`, `feature_registry`/`role_features`, route/capability metadata,
RBAC resolution) is **not a pure deletion**: these currently power working features (dynamic nav,
route & feature gating, admin-approval `canManage`, per-role authoring, dashboard sections, and the
client mirror of RLS). Replacing them with "explicit role checks" is a rework of nav, guards, admin
pages, marketplace/food authoring and RLS-facing logic. Per your rules ("never delete working business
logic without confirmation"), this needs an agreed replacement design and confirmation BEFORE any change.

Recommended order if approved: (1) adopt `useRoles()`/explicit checks for the few required gates;
(2) keep RLS authoritative for data security; (3) remove only then the redundant dynamic-resolution
machinery; (4) typecheck/build after each step.

## Feature completion backlog (schema-ready, placeholder UI)
Projects, Crowdfunding(+payment), Jobs, Events, Directory/Connect, Hostel, Chat, Notifications,
Analytics, Widgets, PWA icons/Capacitor, BFF decision.
