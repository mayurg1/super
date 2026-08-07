# 08 — Features

> Per-feature documentation. Each section: Purpose · Architecture · Database ·
> Components · Services · Workflow · Status · Implemented % · Missing pieces.

**Status legend:**
- ✅ **Implemented** · 🔶 **Prototype** · 🚧 **Placeholder** (route only) · ❌ **Not built**

The **database schema already exists for all features** (migrations 0003–0024). What's
missing is UI + client service façades.

---

## 1. Feed (`/home`)

- **Purpose:** campus social feed — posts, likes, comments (threaded), pagination.
- **Architecture:** `FeedPage` → `FeedProvider` → `createFeedService` → `posts` +
  `post_comments` + `post_likes` (+ media via RLS). Optimistic updates in the provider.
- **Database:** `posts`, `post_media`, `post_comments`, `post_likes`, `post_polls`,
  `poll_options`, `poll_votes`, `stories`, `story_views` (migration 0008 + fixes 0021–0023).
- **Components:** `app/feed/*` — `FeedPage`, `FeedList`, `FeedCard`, `CreatePostCard`,
  `PostComposer`, `CommentThread`, `CommentComposer`, `EmptyFeed`, `ErrorState`,
  `LoadingSkeleton`, `time.ts`.
- **Services:** `createFeedService` (`packages/supabase/src/feed.ts`); `FeedContext` +
  `FeedProvider`.
- **Workflow:** load published posts for the user's campus (paginated) → create post
  (`posts.create`) → like/unlike → view/expand comments → add/edit/delete comment →
  edit/soft-delete own post.
- **Status:** ✅ Implemented (text + likes + comments + pagination).
- **Implemented %:** ~75%. **Missing:**
  - Media upload UI (post_media photos/video).
  - Polls UI (`post_polls`/`poll_options`/`poll_votes`).
  - Stories UI.
  - Realtime feed updates (currently manual refresh/pagination).
  - Search (Postgres `search_document` tsvector is unexposed).
  - Author avatar rendering.

---

## 2. Marketplace (`/market/shop`, `/market/food`)

- **Purpose:** buy/sell campus items; food delivery ordering.
- **Database:** migration 0009 (marketplace) + 0013 (food): `marketplace_categories`,
  `marketplace_products`, `product_media`, `product_favorites`, `product_reports`;
  `food_vendors`, `food_menu_categories`, `food_menu_items`, `food_orders`,
  `food_order_items`, `food_order_events`.
- **Components:** **none** — both routes are `PlaceholderPage`.
- **Services:** **none**.
- **Status:** 🚧 Placeholder. **Missing:** everything (listing UI, search/filter, cart,
  orders, payment, vendor management UI).
- **Implemented %:** ~0% (schema only).

---

## 3. Events (`/connect/events`)

- **Purpose:** campus event listing, registration, check-in.
- **Database:** migration 0011: `events`, `event_media`, `event_registrations` (in
  realtime publication).
- **Components/services:** none — placeholder.
- **Status:** 🚧 Placeholder. **Implemented %:** ~0% (schema only).

---

## 4. Projects (`/projects`, `/projects/mine`, `/projects/crowdfund`)

- **Purpose:** collaborative projects + crowdfunding campaigns.
- **Database:** migration 0010: `projects`, `project_members`, `project_skills`,
  `project_media`, `campaigns`, `campaign_contributions`, `campaign_updates`,
  `payment_transactions`.
- **Components/services:** none — placeholders.
- **Status:** 🚧 Placeholder. **Implemented %:** ~0% (schema only; payment provider not
  integrated).

---

## 5. Jobs (`/connect/jobs`)

- **Purpose:** job postings and applications.
- **Database:** migration 0011: `jobs`, `job_skills`, `job_applications`,
  `job_application_documents`.
- **Components/services:** none — placeholder.
- **Status:** 🚧 Placeholder. **Implemented %:** ~0% (schema only).

---

## 6. Hostel (`/hostel`)

- **Purpose:** hostel catalog, room allocation, outpasses, complaints, attendance.
- **Database:** migration 0012: `hostels`, `hostel_blocks`, `hostel_rooms`,
  `hostel_room_allocations`, `outpass_requests`, `hostel_complaints`, `hostel_attendance`.
- **Components/services:** none — placeholder.
- **Status:** 🚧 Placeholder. **Implemented %:** ~0% (schema only).

---

## 7. Profile (`/profile`, `/profile/settings`)

- **Purpose:** view/edit profile, directory visibility, education/experience/skills,
  settings.
- **Database:** `profiles`, `profile_educations`, `profile_experiences`, `skills`,
  `profile_skills`, `user_settings` (migration 0004).
- **Components/services:** partial. `ProfileProvider` + `createProfileService` bootstrap
  and update the **basic** `profiles` row. `DashboardPage` shows profile/summary bits.
  The `/profile` and `/profile/settings` routes are **placeholders**.
- **Status:** 🔶 Prototype (base profile writable; full feature placeholder).
- **Implemented %:** ~20%. **Missing:** profile page UI, avatar upload, education/
  experience/skills editors, settings page.

---

## 8. Directory (`/connect/alumni|students|faculty`, Connect)

- **Purpose:** browse people by role (alumni/students/faculty).
- **Database:** `profiles` (visibility rules) + `user_roles`; `connections`,
  `conversations`, etc.
- **Components/services:** none — placeholders.
- **Status:** 🚧 Placeholder. **Implemented %:** ~0%.

---

## 9. Messaging / Chat

- **Purpose:** 1:1 & group conversations, read receipts, attachments.
- **Database:** migration 0014: `connections`, `conversations`, `conversation_members`,
  `messages`, `message_attachments`, `message_receipts` (all in realtime publication).
- **Components/services:** none. `packages/supabase/src/realtime.ts` façade exists but is
  unused.
- **Status:** ❌ Not built (schema + realtime publication only). **Implemented %:** ~0%.

---

## 10. Notifications

- **Purpose:** in-app/push notifications with templates and deliveries.
- **Database:** migration 0015: `notification_templates`, `notifications`,
  `notification_deliveries` (`notifications` in realtime publication).
- **Components/services:** none — the topbar bell button is a stub ("coming soon").
- **Status:** ❌ Not built. **Implemented %:** ~0%.

---

## 11. Admin (`/admin`, `/admin/requests`, `/admin/requests/:id`)

- **Purpose:** review & approve/reject role requests (current scope).
- **Architecture:** `AdminRequestsPage` (list) → `AdminRequestDetailPage` (approve/reject)
  → `RoleRequestsProvider` → `createRoleRequestService`.
- **Database:** `role_requests` (migration 0024), `user_roles`, `roles`.
- **Components:** `pages/AdminRequestsPage.tsx`, `pages/AdminRequestDetailPage.tsx`.
- **Services:** `createRoleRequestService` (`roleRequests.ts`); `RoleRequestsProvider`.
- **Workflow:** admin (has `rbac.manage`) opens `/admin/requests` → sees pending list →
  detail page → approve (upserts `user_roles` + marks approved) or reject (with note).
- **Status:** ✅ Implemented (role requests). Broader admin (content moderation, hostels,
  etc.) is not built.
- **Implemented %:** ~25% (only role-request administration exists).

---

## 12. Role Requests

- **Purpose:** users request a campus role during/after onboarding; admins decide.
- **Architecture:** `RoleRequestsProvider` → `createRoleRequestService` →
  `role_requests` + `user_roles`.
- **Database:** `role_requests` (migration 0024), `user_roles`, `roles`, `campuses`.
- **Components:** `OnboardingPage` (submit), `AdminRequestsPage`/`AdminRequestDetailPage`
  (review), `PendingApprovalPage` (status).
- **Services:** `createRoleRequestService`: `create`, `listMine`, `listPending`,
  `findRoleByKey`, `approve`, `reject`.
- **Workflow:** submit (pending) → admin approve (assigns role) / reject (stores reason).
  User polls every 15s on the pending page and is routed to `/home` once approved.
- **Status:** ✅ Implemented.
- **Implemented %:** ~90%. **Missing:** supporting-document upload, student/employee ID
  fields UI, email notification on decision.

---

## 13. Onboarding

- **Purpose:** multi-step wizard to set up a new user's profile and request a role.
- **Architecture:** single `OnboardingPage` with a step state machine
  (`welcome → profile → academic → role → verification → review`).
- **Database reads:** `campuses` (by `DEFAULT_CAMPUS_CODE`), `departments`, `programs`;
  writes `profiles`; inserts `role_requests`.
- **Components:** `pages/OnboardingPage.tsx` (+ `StepSelect`, role grid, review list).
- **Services:** `useProfile().updateProfile`, `useRoleRequests().createRequest`.
- **Workflow:** see [`07_AUTHENTICATION.md`](./07_AUTHENTICATION.md) §14.
- **Status:** ✅ Implemented.
- **Implemented %:** ~85%. **Missing:** document upload, email-verified gating, dynamic
  campus selection UI, graduation-year defaulting.

---

## 14. Pending Approval

- **Purpose:** show the user their role-request status and auto-progress when approved.
- **Architecture:** `PendingApprovalPage` polls authz/profile/request every **15s** and
  redirects to `/home` when a role is granted.
- **Components:** `pages/PendingApprovalPage.tsx` (request status card, "Check status"
  button).
- **Services:** `useAuthorization().refreshAuthorization`, `useProfile().refreshProfile`,
  `useRoleRequests().refresh`.
- **Status:** ✅ Implemented.
- **Implemented %:** ~90%.

---

## 15. Dashboard (Home variant)

- **Purpose:** welcome + quick actions + pinned modules + "recent"/"announcements"/
  "statistics" cards.
- **Architecture:** `DashboardProvider` → `buildDashboard(features, quickActions)` →
  `DashboardPage` renders cards/links.
- **Components:** `dashboard/DashboardPage.tsx`, `DashboardProvider.tsx`,
  `dashboardBuilder.ts`.
- **Status:** 🔶 Prototype (many cards show "coming soon").
- **Implemented %:** ~30%. **Note:** `DashboardPage` is **not wired to a route**; `/home`
  renders the **Feed**, not the Dashboard.

---

## 16. Feature Status Summary

| Feature | Route | Status | Implemented % |
|---------|-------|--------|---------------|
| Feed | `/home` | ✅ | ~75% |
| Onboarding | `/onboarding` | ✅ | ~85% |
| Pending Approval | `/pending-approval` | ✅ | ~90% |
| Role Requests | — | ✅ | ~90% |
| Admin (role requests) | `/admin/requests` | ✅ | ~25% |
| Profile | `/profile` | 🔶 | ~20% |
| Dashboard | (unregistered) | 🔶 | ~30% |
| Marketplace | `/market/shop` | 🚧 | ~0% |
| Food Delivery | `/market/food` | 🚧 | ~0% |
| Projects & Crowdfunding | `/projects` | 🚧 | ~0% |
| Events | `/connect/events` | 🚧 | ~0% |
| Jobs | `/connect/jobs` | 🚧 | ~0% |
| Directory / Connect | `/connect/*` | 🚧 | ~0% |
| Hostel | `/hostel` | 🚧 | ~0% |
| Messaging / Chat | — | ❌ | ~0% |
| Notifications | — | ❌ | ~0% |


