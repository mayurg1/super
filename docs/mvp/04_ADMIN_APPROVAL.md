# 04 — Admin Approval

Complete role-request → approval flow (this is **working functionality — must not be deleted**).

## Flow
```
Signup
  ↓
Onboarding wizard submits role request
  ↓
role_requests row created (status = 'pending')
  ↓
User lands on PendingApprovalPage (polls state every ~15s)
  ↓
Admin logs in → /admin/requests (AdminRequestsPage)
  ↓
Admin reviews a request → AdminRequestDetailPage
  ↓
Approve  → role granted (user_roles inserted) → user becomes 'ready'
Reject   → request marked rejected (reason shown)
```
## Components / services
- `pages/OnboardingPage.tsx` — collects profile + role request.
- `pages/PendingApprovalPage.tsx` — shows request status; auto-navigates to `/home` when approved.
- `pages/AdminRequestsPage.tsx` / `AdminRequestDetailPage.tsx` — list + approve/reject (gated by `canManage` = `hasPermission('rbac.manage')`).
- `createRoleRequestService` (`roleRequests.ts`): `create`, `listMine`, `listPending`, `findRoleByKey`, `approve`, `reject`.
- `RoleRequestsProvider` (`useRoleRequests`).

## Database
- `role_requests` (user_id, role_id, campus_id, status: pending/approved/rejected, reason, reviewed_by).
- `user_roles` — written on approve (`granted_by = admin`).

## Guarding
- Admin pages require `rbac.manage` permission (role_requests RLS + client `canManage`). This flow's
  gating depends on the authorization layer (see the STEP‑3 risk note).
