import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@supercampus/core';
import { Button, Card, EmptyState, Spinner } from '@supercampus/shared';
import { createProjectService, useAuth, useSupabase, type ProjectResult } from '@supercampus/supabase';

export function MyProjectsPage(): React.ReactElement {
  const client = useSupabase();
  const { user } = useAuth();
  const service = createProjectService(client);
  const [projects, setProjects] = useState<ProjectResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    let active = true;
    setLoading(true);
    void service.getMyProjects(user.id).then((result) => {
      if (!active) return;
      setLoading(false);
      if (result.error) setError(result.error);
      else setProjects(result.data ?? []);
    });
    return () => { active = false; };
  }, [service, user]);

  if (loading) return <Spinner label="Loading your projects" />;
  if (error) return <EmptyState icon="🚀" title="Could not load projects" description={error} />;
  if (projects.length === 0) return <EmptyState icon="🚀" title="No projects yet" description="Create or join a project to see it here." action={<Link to={ROUTES.projects}><Button variant="primary">Browse projects</Button></Link>} />;

  return (
    <section className="sc-projects" aria-labelledby="my-projects-title">
      <header className="sc-projects-heading"><h1 id="my-projects-title">My Projects</h1></header>
      <div className="sc-product-grid">
        {projects.map((p) => (
          <Card key={p.id} padding="md" className="sc-project-card">
            <Link to={`${ROUTES.projectDetail.replace(':projectId', p.id)}`}><h3>{p.title}</h3></Link>
            <p className="sc-project-summary">{p.summary || p.body?.slice(0, 120)}</p>
            <p className="sc-project-meta">{p.status} · {p.category}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}