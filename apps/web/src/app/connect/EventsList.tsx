import { useCallback, useEffect, useState } from 'react';
import { Card, EmptyState, Spinner } from '@supercampus/shared';
import { createEventService, useAuth, useSupabase, type EventResult } from '@supercampus/supabase';

export function EventsList({ search }: { search: string }): React.ReactElement {
  const client = useSupabase(); const { user } = useAuth();
  const svc = useCallback(() => createEventService(client), [client]);
  const [events, setEvents] = useState<EventResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return; let a = true; setLoading(true);
    void svc().getEvents({}).then((r) => { if (!a) return; setLoading(false); if (r.data) setEvents(r.data.events); });
    return () => { a = false; };
  }, [svc, user]);

  const q = search.toLowerCase();
  const filtered = events.filter((e) => !q || e.title.toLowerCase().includes(q) || e.venue.toLowerCase().includes(q));

  if (loading) return <Spinner label="Loading events" />;
  if (filtered.length === 0) return <EmptyState icon="🎉" title="No events found" description="Try a different search." />;
  return (
    <div className="sc-product-grid">{filtered.map((e) => (
      <Card key={e.id} padding="md">
        <h3>{e.title}</h3>
        <p>{e.venue} · {new Date(e.startsAt).toLocaleDateString()}</p>
        <p className="sc-product-muted">{e.registrationCount} registered · capacity {e.capacity ?? 'unlimited'}</p>
      </Card>
    ))}</div>
  );
}