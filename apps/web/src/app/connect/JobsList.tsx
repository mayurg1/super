import { useCallback, useEffect, useState } from 'react';
import { Card, EmptyState, Spinner } from '@supercampus/shared';
import { createJobService, useAuth, useSupabase, type JobResult } from '@supercampus/supabase';

export function JobsList({ search }: { search: string }): React.ReactElement {
  const client = useSupabase(); const { user } = useAuth();
  const svc = useCallback(() => createJobService(client), [client]);
  const [jobs, setJobs] = useState<JobResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return; let a = true; setLoading(true);
    void svc().getJobs({}).then((r) => { if (!a) return; setLoading(false); if (r.data) setJobs(r.data.jobs); });
    return () => { a = false; };
  }, [svc, user]);

  const q = search.toLowerCase();
  const filtered = jobs.filter((j) => !q || j.title.toLowerCase().includes(q) || j.employer.toLowerCase().includes(q));

  if (loading) return <Spinner label="Loading jobs" />;
  if (filtered.length === 0) return <EmptyState icon="💼" title="No jobs found" description="Try a different search." />;
  return (
    <div className="sc-product-grid">{filtered.map((j) => (
      <Card key={j.id} padding="md">
        <h3>{j.title}</h3>
        <p>{j.employer} · {j.location || 'On-campus'}</p>
        <p className="sc-product-muted">{j.employmentType} · {j.status}</p>
      </Card>
    ))}</div>
  );
}