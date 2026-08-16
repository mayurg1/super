import { useEffect, useState } from 'react';
import { Button, EmptyState } from '@supercampus/shared';
import { createDirectoryService, useAuth, useSupabase } from '@supercampus/supabase';

export function ConnectionRequestsCard(): React.ReactElement | null {
  const client = useSupabase();
  const { user } = useAuth();
  const [requests, setRequests] = useState<{ id: string; userId: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const svc = createDirectoryService(client);
    void svc.getConnectionRequests(user.id).then((r) => {
      setLoading(false);
      if (r.data) setRequests(r.data as { id: string; userId: string }[]);
    });
  }, [client, user]);

  if (loading || requests.length === 0) {
    return (
      <div className="sc-connect-requests">
        <h3>Connection Requests</h3>
        <EmptyState icon="👥" title="No requests" />
      </div>
    );
  }

  return (
    <div className="sc-connect-requests">
      <h3>Connection Requests</h3>
      {requests.map((r) => (
        <div key={r.id} className="sc-connect-request-actions">
          <span>User {r.userId.slice(0, 8)}</span>
          <Button size="sm" variant="primary">Accept</Button>
          <Button size="sm" variant="ghost">Reject</Button>
        </div>
      ))}
    </div>
  );
}