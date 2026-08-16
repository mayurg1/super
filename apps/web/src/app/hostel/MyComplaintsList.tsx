import { Card, EmptyState, Spinner } from '@supercampus/shared';
import { useHostel } from './HostelContext';
import { HostelStatusBadge } from './HostelStatusBadge';

export function MyComplaintsList(): React.ReactElement {
  const { myComplaints, loading } = useHostel();

  if (loading && myComplaints.length === 0) return <Spinner label="Loading your complaints" />;

  if (myComplaints.length === 0) {
    return (
      <Card>
        <EmptyState
          icon="📢"
          title="No complaints yet"
          description="Any issues you report will show up here with their status."
        />
      </Card>
    );
  }

  return (
    <div className="sc-hostel-list">
      {myComplaints.map((complaint) => (
        <Card key={complaint.id} className="sc-request-card" padding="md">
          <div className="sc-review-list">
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
              <strong>
                <HostelStatusBadge status={complaint.status} />
              </strong>
            </div>
          </div>
          <p className="sc-muted">Reported {new Date(complaint.created_at).toLocaleString()}</p>
        </Card>
      ))}
    </div>
  );
}