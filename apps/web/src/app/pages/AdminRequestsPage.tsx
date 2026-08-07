import { useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ROUTES } from '@supercampus/core';
import { useRoleRequests } from '@supercampus/supabase';
import { Button, Card, EmptyState, Spinner } from '@supercampus/shared';
import { useUserApplicationState } from '../providers/useUserApplicationState';

export function AdminRequestsPage(): React.ReactElement {
  const { status } = useUserApplicationState();
  const { pendingRequests, loading, canManage, refreshPending } = useRoleRequests();

  useEffect(() => {
    if (canManage) void refreshPending();
  }, [canManage, refreshPending]);

  if (status === 'loading') return <Spinner label="Loading admin" />;
  if (status !== 'ready' || !canManage) return <Navigate to={ROUTES.home} replace />;

  return (
    <div>
      <h1 className="sc-page-title">🛡️ Pending requests</h1>
      <p className="sc-page-desc">Review and approve role requests from new members.</p>
      {loading && pendingRequests.length === 0 ? <Spinner label="Loading requests" /> : null}
      {!loading && pendingRequests.length === 0 ? (
        <Card>
          <EmptyState
            icon="🎉"
            title="No pending requests"
            description="There are no role requests waiting for review."
          />
        </Card>
      ) : (
        pendingRequests.map((request) => (
          <Card key={request.id} className="sc-request-card">
            <div className="sc-request-meta">
              <strong>{request.profiles?.display_name ?? 'New member'}</strong>
              <span className="sc-badge">{request.requested_role_id}</span>
            </div>
            <p className="sc-muted">Requested {new Date(request.created_at).toLocaleString()}</p>
            <Link to={`${ROUTES.adminRequests}/${request.id}`}>
              <Button variant="outline" size="sm">
                Review
              </Button>
            </Link>
          </Card>
        ))
      )}
    </div>
  );
}
