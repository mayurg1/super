import { useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { ROUTES } from '@supercampus/core';
import { useAuthorization, useRoleRequests } from '@supercampus/supabase';
import { Button, Card, Input, Spinner } from '@supercampus/shared';
import { useUserApplicationState } from '../providers/useUserApplicationState';

export function AdminRequestDetailPage(): React.ReactElement {
  const { requestId = '' } = useParams();
  const navigate = useNavigate();
  const { status } = useUserApplicationState();
  const { pendingRequests, canManage, approve, reject, refreshPending } = useRoleRequests();
  const { refreshAuthorization } = useAuthorization();

  const [busy, setBusy] = useState<'approve' | 'reject' | null>(null);
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  if (status === 'loading') return <Spinner label="Loading request" />;
  if (status !== 'ready' || !canManage) return <Navigate to={ROUTES.home} replace />;

  const request = pendingRequests.find((r) => r.id === requestId) ?? null;

  if (!request) {
    return (
      <div>
        <h1 className="sc-page-title">Request not found</h1>
        <p className="sc-page-desc">This request may have already been reviewed.</p>
        <Link to={ROUTES.adminRequests}>
          <Button variant="outline">Back to requests</Button>
        </Link>
      </div>
    );
  }
  const current = request;

  async function handleApprove(): Promise<void> {
    setBusy('approve');
    setError(null);
    const ok = await approve(current.id);
    if (ok) {
      await refreshAuthorization();
      await refreshPending();
      setDone(true);
    } else {
      setError('The request could not be approved.');
    }
    setBusy(null);
  }

  async function handleReject(): Promise<void> {
    setBusy('reject');
    setError(null);
    const ok = await reject(current.id, note);
    if (ok) {
      await refreshAuthorization();
      await refreshPending();
      navigate(ROUTES.adminRequests, { replace: true });
    } else {
      setError('The request could not be rejected.');
    }
    setBusy(null);
  }

  return (
    <div>
      <h1 className="sc-page-title">Request details</h1>
      <p className="sc-page-desc">Review the role request before deciding.</p>
      <Card>
        <div className="sc-review-list">
          <div>
            <span>Member</span>
            <strong>{request.profiles?.display_name ?? 'New member'}</strong>
          </div>
          <div>
            <span>Requested role</span>
            <strong className="sc-badge">{request.requested_role_id}</strong>
          </div>
          <div>
            <span>Status</span>
            <strong>{request.status}</strong>
          </div>
          <div>
            <span>Submitted</span>
            <strong>{new Date(request.created_at).toLocaleString()}</strong>
          </div>
          {request.rejection_reason ? (
            <div>
              <span>Rejection note</span>
              <strong>{request.rejection_reason}</strong>
            </div>
          ) : null}
        </div>
      </Card>
      <Card className="sc-admin-actions">
        <Input
          label="Rejection note (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Reason for rejecting"
        />
        {error ? (
          <p className="sc-field-error" role="alert">
            {error}
          </p>
        ) : null}
        {done ? (
          <p className="sc-muted">
            Approved. The member now has access — they’ll be redirected to Home on next check.
          </p>
        ) : (
          <div className="sc-inline-actions">
            <Link to={ROUTES.adminRequests}>
              <Button variant="outline" disabled={busy !== null}>
                Back
              </Button>
            </Link>
            <Button variant="outline" onClick={() => void handleReject()} disabled={busy !== null}>
              {busy === 'reject' ? 'Rejecting…' : 'Reject'}
            </Button>
            <Button onClick={() => void handleApprove()} disabled={busy !== null}>
              {busy === 'approve' ? 'Approving…' : 'Approve & grant role'}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
