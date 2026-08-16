import { useState } from 'react';
import { Button, Card, EmptyState, Spinner } from '@supercampus/shared';
import type { ReviewComplaintStatus, ReviewOutpassStatus } from '@supercampus/supabase';
import { useHostel } from './HostelContext';

export function HostelReviewQueue(): React.ReactElement {
  const {
    pendingOutpasses,
    openComplaints,
    loading,
    canManageOutpasses,
    canManageComplaints,
    reviewOutpass,
    reviewComplaint,
  } = useHostel();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleOutpass(id: string, status: ReviewOutpassStatus): Promise<void> {
    setBusy(`outpass:${id}:${status}`);
    setError(null);
    const ok = await reviewOutpass(id, status);
    if (!ok) setError('That outpass request could not be updated. Please try again.');
    setBusy(null);
  }

  async function handleComplaint(id: string, status: ReviewComplaintStatus): Promise<void> {
    setBusy(`complaint:${id}:${status}`);
    setError(null);
    const ok = await reviewComplaint(id, status);
    if (!ok) setError('That complaint could not be updated. Please try again.');
    setBusy(null);
  }

  const nothingToReview =
    (!canManageOutpasses || pendingOutpasses.length === 0) &&
    (!canManageComplaints || openComplaints.length === 0);

  return (
    <div className="sc-hostel-stack">
      <p className="sc-page-desc">
        Approve or reject outpass requests, and assign or resolve open complaints.
      </p>
      {error ? (
        <p className="sc-field-error" role="alert">
          {error}
        </p>
      ) : null}
      {canManageOutpasses ? (
        <section className="sc-hostel-queue-section">
          <h3 className="sc-hostel-queue-title">🕐 Pending outpass requests</h3>
          {loading && pendingOutpasses.length === 0 ? (
            <Spinner label="Loading pending outpasses" />
          ) : pendingOutpasses.length === 0 ? (
            <Card>
              <EmptyState icon="🎉" title="No pending outpasses" description="All outpass requests are reviewed." />
            </Card>
          ) : (
            pendingOutpasses.map((request) => (
              <Card key={request.id} className="sc-request-card" padding="md">
                <div className="sc-review-list">
                  <div>
                    <span>Resident</span>
                    <strong>{request.resident_id}</strong>
                  </div>
                  <div>
                    <span>Destination</span>
                    <strong>{request.destination}</strong>
                  </div>
                  <div>
                    <span>Reason</span>
                    <strong>{request.reason}</strong>
                  </div>
                  <div>
                    <span>Trip</span>
                    <strong>
                      {new Date(request.depart_at).toLocaleString()} → {new Date(request.return_at).toLocaleString()}
                    </strong>
                  </div>
                  <div>
                    <span>Status</span>
                    <strong>{request.status}</strong>
                  </div>
                </div>
                <div className="sc-inline-actions">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={busy !== null}
                    onClick={() => void handleOutpass(request.id, 'rejected')}
                  >
                    {busy === `outpass:${request.id}:rejected` ? 'Rejecting…' : 'Reject'}
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={busy !== null}
                    onClick={() => void handleOutpass(request.id, 'approved')}
                  >
                    {busy === `outpass:${request.id}:approved` ? 'Approving…' : 'Approve'}
                  </Button>
                </div>
              </Card>
            ))
          )}
        </section>
      ) : null}

      {canManageComplaints ? (
        <section className="sc-hostel-queue-section">
          <h3 className="sc-hostel-queue-title">📢 Open complaints</h3>
          {loading && openComplaints.length === 0 ? (
            <Spinner label="Loading open complaints" />
          ) : openComplaints.length === 0 ? (
            <Card>
              <EmptyState icon="🎉" title="No open complaints" description="The complaint queue is clear." />
            </Card>
          ) : (
            openComplaints.map((complaint) => (
              <Card key={complaint.id} className="sc-request-card" padding="md">
                <div className="sc-review-list">
                  <div>
                    <span>Resident</span>
                    <strong>{complaint.resident_id}</strong>
                  </div>
                  <div>
                    <span>Category</span>
                    <strong>{complaint.category}</strong>
                  </div>
                  <div>
                    <span>Description</span>
                    <strong>{complaint.description}</strong>
                  </div>
                  <div>
                    <span>Room</span>
                    <strong>{complaint.room_id ?? '—'}</strong>
                  </div>
                  <div>
                    <span>Status</span>
                    <strong>{complaint.status}</strong>
                  </div>
                </div>
                <div className="sc-inline-actions">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={busy !== null}
                    onClick={() => void handleComplaint(complaint.id, 'assigned')}
                  >
                    {busy === `complaint:${complaint.id}:assigned` ? 'Assigning…' : 'Assign to me'}
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={busy !== null}
                    onClick={() => void handleComplaint(complaint.id, 'resolved')}
                  >
                    {busy === `complaint:${complaint.id}:resolved` ? 'Resolving…' : 'Mark resolved'}
                  </Button>
                </div>
              </Card>
            ))
          )}
        </section>
      ) : null}

      {nothingToReview ? (
        <Card>
          <EmptyState icon="🗂" title="Nothing to review" description="There are no pending items in your queues." />
        </Card>
      ) : null}
    </div>
  );
}