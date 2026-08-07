import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { ROUTES } from '@supercampus/core';
import { useAuthorization, useProfile, useRoleRequests } from '@supercampus/supabase';
import { Button, Card, Spinner } from '@supercampus/shared';
import { useUserApplicationState } from '../providers/useUserApplicationState';

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pending approval',
  approved: 'Approved',
  rejected: 'Rejected',
};

export function PendingApprovalPage(): React.ReactElement {
  const location = useLocation();
  const { status } = useUserApplicationState();
  const { refreshAuthorization } = useAuthorization();
  const { refreshProfile } = useProfile();
  const { current, loading, refresh } = useRoleRequests();

  // On a fixed cadence, re-check authorization + request state so that an
  // approved user is immediately routed to Home once the role is granted.
  useEffect(() => {
    const id = window.setInterval(() => {
      void refreshAuthorization();
      void refreshProfile();
      void refresh();
    }, 15_000);
    return () => window.clearInterval(id);
  }, [refreshAuthorization, refreshProfile, refresh]);

  if (status === 'loading') return <Spinner label="Checking your request" />;
  if (status === 'anonymous')
    return <Navigate to={ROUTES.login} state={{ from: location }} replace />;
  if (status === 'onboarding') return <Navigate to={ROUTES.onboarding} replace />;
  if (status === 'ready') return <Navigate to={ROUTES.home} replace />;

  const requestStatus = current?.status ?? 'pending';
  const roleLabel = current ? current.requested_role_id || '—' : '—';

  const recheck = async (): Promise<void> => {
    await refreshAuthorization();
    await refreshProfile();
    await refresh();
  };

  return (
    <div className="sc-auth-page">
      <Card padding="lg" className="sc-auth-card">
        <h1 className="sc-auth-title">⏳ Pending approval</h1>
        <p className="sc-auth-sub">
          Your role request is with an administrator. You’ll be able to open SUPERCAMPUS as soon as
          it’s approved.
        </p>
        {loading && !current ? (
          <Spinner label="Loading your request" />
        ) : (
          <div className="sc-review-list">
            <div>
              <span>Requested role</span>
              <strong>{roleLabel}</strong>
            </div>
            <div>
              <span>Status</span>
              <strong className={requestStatus === 'rejected' ? 'sc-text-error' : ''}>
                {STATUS_LABEL[requestStatus] ?? requestStatus}
              </strong>
            </div>
            <div>
              <span>Submitted</span>
              <strong>{current ? new Date(current.created_at).toLocaleString() : '—'}</strong>
            </div>
          </div>
        )}
        <Button fullWidth variant="outline" onClick={() => void recheck()} disabled={loading}>
          Check status
        </Button>
      </Card>
    </div>
  );
}
