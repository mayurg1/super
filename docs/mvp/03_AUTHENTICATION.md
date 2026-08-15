# 03 — Authentication

Backed by Supabase Auth (email/password) wrapped by `createAuthService` (`packages/supabase/src/auth.ts`)
and `AuthProvider` (auto token refresh, session restore on boot).

## Login
- `LoginPage` (`/login`) → `useAuth().signIn({email,password})` → Supabase `signInWithPassword`.
- Success → `navigate(ROUTES.home)`.

## Signup
- `SignUpPage` (`/signup`) → `useAuth().signUp({email,password})`.
- If a session is returned immediately (email confirm disabled) routes toward onboarding;
  otherwise shows "check your email to confirm".

## Session
- `AuthProvider` restores session from Supabase storage and exposes `{user, authenticated, loading,
  signIn, signUp, signOut, updatePassword}`.
- Route guards: `PublicRoute` (anonymous only), `ProtectedLayout` (authenticated), driven by
  `useUserApplicationState` (status: loading/anonymous/onboarding/pending/ready).

## Logout
- `Header.signOut()` → Supabase `signOut()`; guards then route to `/login`.

## Password reset
- `ResetPasswordPage` (`/reset-password`) via Supabase reset-password; `updatePassword` service exists (final UI step pending).

## User lifecycle
```
Signup → profile auto-created (trigger) → Onboarding wizard (fills profile, picks campus/role)
 → role request submitted → Pending Approval (polls) → Admin approves/rejects → user_roles granted
 → status becomes 'ready' → enters protected app
```
See `04_ADMIN_APPROVAL.md` for the approval flow.
