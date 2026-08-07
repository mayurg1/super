import { useAuth, useAuthorization, useProfile, useRoleRequests } from '@supercampus/supabase';

export type UserApplicationStage = 'loading' | 'anonymous' | 'onboarding' | 'pending' | 'ready';

export interface UserApplicationState {
  status: UserApplicationStage;
  isAuthenticated: boolean;
  hasRole: boolean;
  hasPendingRequest: boolean;
}

/**
 * Derives the single source of truth for where an authenticated user belongs:
 *   - loading   → app is still restoring session/data
 *   - anonymous → not signed in (login/signup)
 *   - ready     → has a granted role (e.g. super_admin) → Home
 *   - pending   → has a pending role request → Pending Approval
 *   - onboarding→ no role and no request yet → Onboarding wizard
 */
export function useUserApplicationState(): UserApplicationState {
  const { authenticated, loading: authLoading } = useAuth();
  const { loading: profileLoading } = useProfile();
  const authorization = useAuthorization();
  const roleRequests = useRoleRequests();

  const hasRole = authorization.roles.length > 0;
  const hasPendingRequest = roleRequests.current?.status === 'pending';
  // Only factor request loading in for authenticated users; anonymous users never wait on it.
  const loading = authLoading || profileLoading || authorization.loading || (authenticated ? roleRequests.loading : false);

  let status: UserApplicationStage = 'loading';
  if (loading) {
    status = 'loading';
  } else if (!authenticated) {
    status = 'anonymous';
  } else if (hasRole) {
    status = 'ready';
  } else if (hasPendingRequest) {
    status = 'pending';
  } else {
    status = 'onboarding';
  }

  return { status, isAuthenticated: authenticated, hasRole, hasPendingRequest };
}
