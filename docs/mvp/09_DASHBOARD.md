# 09 — Dashboard

## Purpose
A "home variant" landing that greets the user and surfaces enabled modules + quick actions and
placeholder stat cards. Data is driven by the user's enabled features (dynamic — this is why the
feature layer is load-bearing for the dashboard).

## Queries / data
- `useProfile()` — greeting name, `@handle`.
- `useRoles()` — role names shown to the user.
- `useDashboard()` → `buildDashboard(features, quickActions)` produces sections:
  Quick actions / Pinned features / Recommended modules (each lists nav items filtered by features).

## Components
`DashboardPage` → `DashboardCard` (title + children), `DashboardSection`, `DashboardLayout`.

## Widgets / KPIs / Charts
- Present as **placeholder cards**: "Recently used", "Announcements", "Campus updates", "Statistics".
- No charts/analytics implemented yet (`analytics_views` schema-ready; `analytics.read` permission exists).
- Suggested future: analytic cards gated by `analytics.read`; widgets from `app/features/widgets` (legacy JS, unwired).

## Tables
`profiles`, `roles`, `user_roles`, `role_features`, `feature_registry` (drive nav/sections),
`campuses`. (`analytics_views` future.)

## Route
`/dashboard` → `DashboardPage`, gated by feature `dashboard` (granted to every role).
