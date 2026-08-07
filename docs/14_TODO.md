# 14 — TODO

> Complete work backlog for SUPERCAMPUS, derived from the current codebase state.

Priorities reflect production-readiness impact. Nothing is fabricated — each item maps to
something observed in the code.

---

## 1. Critical

Security & correctness blockers.

- [ ] **Wire realtime for notifications & chat** — tables are published
      (`supabase_realtime`) but no subscription is used (`packages/supabase/src/realtime.ts`
      unused).
- [ ] **Enforce RLS read access on all storage objects** — buckets are private, but no
      parent-entity access functions grant object reads yet (migration 0006 comment).
- [ ] **Gate every protected route with `FeatureRoute`/`PermissionRoute`** — guards are
      implemented but not attached to any route (`routes/guards.tsx`).
- [ ] **Verify RLS on moderation/audit/analytics tables before exposing any UI** (they are
      schema-only today, so not currently reachable).
- [ ] **Remove/regenerate `service_role` exposure risks** — confirm
      `@supercampus/supabase/server` is never bundled; add a Vite guard/CI check.

---

## 2. High

Important product/robustness work.

- [ ] **BFF / API server** — `services/` (or `server/`) folder does not exist;
      `@supercampus/api-client` is unused. Build the planned BFF or remove the dead client.
- [ ] **Wire `DashboardPage` to a route** (currently `DashboardPage` is unregistered;
      `/home` renders Feed).
- [ ] **Feed media uploads** — `post_media` + storage façade exist but no upload UI.
- [ ] **Feed search** — `posts.search_document` (tsvector) is not exposed.
- [ ] **Profile & Settings pages** — `/profile` and `/profile/settings` are placeholders;
      base profile is writable but no page exists.
- [ ] **Profile edit for education/experience/skills** — tables exist, no service/UI.
- [ ] **Notifications service + UI** — the topbar bell is a stub.
- [ ] **Image/avatar upload** (`media_assets` flow) so authors/avatars can render.
- [ ] **Email/password update page** — `updatePassword` exists in auth service but no UI.
- [ ] **Supporting-document upload for role requests** (schema field exists; UI does not).

---

## 3. Medium

Feature completion with existing schema.

- [ ] **Marketplace UI** (`product` flow, favorites, reports) — schema ready.
- [ ] **Projects & crowdfunding UI** — schema ready; note payment provider not integrated
      (`payment_transactions`).
- [ ] **Events UI + registration** — schema ready; `event_registrations` in realtime.
- [ ] **Jobs UI + applications** — schema ready.
- [ ] **Hostel UI** (outpasses, complaints, attendance, allocations) — schema ready.
- [ ] **Feed polls** (`post_polls`/`poll_options`/`poll_votes`) — schema ready.
- [ ] **Feed stories** (`stories`/`story_views`) — schema ready.
- [ ] **Connection/directory browsing** — profiles + `connections` schema ready.
- [ ] **Chat UI** (conversations/messages/receipts) — schema + realtime ready.
- [ ] **Attach `RouteMetadata` features to routes** and activate declarative feature gating.
- [ ] **Consume `feature_flags` table** for runtime toggles (currently unread client-side).

---

## 4. Low

Polish / nice-to-have.

- [ ] **Add iOS/Android icons** to `manifest.webmanifest` (`icons` is empty).
- [ ] **Avatars in feed cards** — `avatarAssetId` is plumbed but not rendered.
- [ ] **Realtime refresh for the feed** (currently manual refresh/pagination).
- [ ] **Remove legacy `BOTTOM_NAV_ITEMS`/`MainLayout`** if unused (only `AppLayout` active).
- [ ] **Remove legacy root `src/` widgets** or fully wire them (see Technical Debt).
- [ ] **Add `.env.example`** (none present).
- [ ] **Add CI** (lint + typecheck + build) — no CI config in repo.
- [ ] **Add tests** — no test framework/config found.
- [ ] **Clean stray `chrome_err.log` / `dom.html`** debug artifacts.

---

## 5. Technical Debt

- [ ] **Legacy root `src/` (JS)** — `src/core/event-bus.js`, `src/features/widgets/*`,
      `src/shared/dom/*`: an unused partial `superold` migration. Decide: delete or migrate
      (`docs/features/widgets-behaviour.md` documents the old behaviour).
- [ ] **`@supercampus/core` legacy auth stack** — `authProvider.ts`, `authService.ts`,
      `sessionStore.ts` (Zustand), routing `guards.ts`/`metadata.ts`, and `contracts` DTO/
      capabilities are **stubs/legacy** not used by the live app. Prune once the BFF lands.
- [ ] **`api-client` is dead code** (built but never called).
- [ ] **`DashboardPage` unregistered**; `MainLayout` unused.
- [ ] **No test suite** — split browser/regression risk is high.
- [ ] **Feed does parallel multi-query aggregation per page** (N+1-ish) — fine now, worth
      optimizing.
- [ ] **Env fallback placeholder** always logs a warning on fresh checkouts (intended but
      noisy).
- [ ] **RLS functions are `security definer`** — audit minimal rights for any new function.

---

## 6. Known Bugs / Risks (observed)

- [ ] **`OnboardingPage` hardcodes role options + `DEFAULT_CAMPUS_CODE`** — campus/role data
      isn't fully dynamic.
- [ ] **PendingApproval relies on 15s polling** — realtime notification would be snappier
      and more correct.
- [ ] **Signup may skip onboarding** — `SignUpPage` navigates to `/home` if a session is
      returned immediately; verify the state machine still routes to onboarding.
- [ ] **Feed soft-delete/visibility edge cases** were patched by migrations 0021–0023;
      regression-test post/media/comment RLS.
- [ ] **`role_requests` has no UI for uploads/IDs** although columns exist — admins cannot
      verify documents today.

---

## 7. Missing Features (planned domains with no product code)

- [ ] Marketplace, Food Delivery, Projects & Crowdfunding, Events, Jobs, Hostel, Directory/
      Connect, Messaging, Notifications, Analytics dashboards, Content Moderation UI,
      Settings UI.
- [ ] Payment provider integration (`payment_transactions` is schema-only).
- [ ] Email/push notification delivery engine (`notification_deliveries` is schema-only).
- [ ] BFF / server-side jobs and edge functions.

---

## 8. Priorities Suggested Next

1. **Critical security/quality items** (§1).
2. **BFF or remove `api-client`** and wire `DashboardPage` (§2).
3. **Feed media/search** + **Profile & Settings pages** (§2) — high user value on the
   implemented foundation.
4. **Pick one schema-ready domain** (e.g. Marketplace or Events) to prove the pattern before
   the rest (§3).
5. **Pay down Technical Debt** (§5) and add CI + tests.
