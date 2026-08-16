import { Card, EmptyState, Spinner } from '@supercampus/shared';
import { useHostel } from './HostelContext';
import { HostelStatusBadge } from './HostelStatusBadge';

export function MyOutpassList(): React.ReactElement {
  const { myOutpasses, loading } = useHostel();

  if (loading && myOutpasses.length === 0) return <Spinner label="Loading your outpass requests" />;

  if (myOutpasses.length === 0) {
    return (
      <Card>
        <EmptyState
          icon="🚪"
          title="No outpass requests yet"
          description="Once you request leave, it will show up here with its approval status."
        />
      </Card>
    );
  }

  return (
    <div className="sc-hostel-list">
      {myOutpasses.map((request) => (
        <Card key={request.id} className="sc-request-card" padding="md">
          <div className="sc-review-list">
            <div>
              <span>Destination</span>
              <strong>{request.destination}</strong>
            </div>
            <div>
              <span>Reason</span>
              <strong>{request.reason}</strong>
            </div>
            <div>
              <span>Departure</span>
              <strong>{new Date(request.depart_at).toLocaleString()}</strong>
            </div>
            <div>
              <span>Return</span>
              <strong>{new Date(request.return_at).toLocaleString()}</strong>
            </div>
            <div>
              <span>Status</span>
              <strong>
                <HostelStatusBadge status={request.status} />
              </strong>
            </div>
          </div>
          <p className="sc-muted">Requested {new Date(request.created_at).toLocaleString()}</p>
        </Card>
      ))}
    </div>
  );
}