import { useSearchParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { ROUTES } from '@supercampus/core';
import { Button, Card, EmptyState, Spinner } from '@supercampus/shared';
import { ProjectsProvider } from './ProjectsProvider';
import { useProjects } from './ProjectsContext';
import { CampaignsProvider } from './CampaignsProvider';
import { CreateProjectForm } from './CreateProjectForm';
import { ProjectsTabBar } from './ProjectsTabBar';
import { CampaignsList } from './CampaignsList';

const STATUS_OPTIONS = [null, 'open', 'active', 'completed'] as const;

function ProjectList(): React.ReactElement {
  const { projects, loading, loadingMore, error, hasMore, statusFilter, setStatusFilter, loadMore, refresh } = useProjects();

  if (loading) return <Spinner label="Loading projects" />;
  if (error && projects.length === 0) return <EmptyState title="Could not load projects" description={error} action={<Button variant="primary" onClick={() => void refresh()}>Try again</Button>} />;

  return (
    <>
      <CreateProjectForm />
      <div className="sc-marketplace-categories" role="tablist" aria-label="Filter by status">
        {STATUS_OPTIONS.map((s) => (
          <button key={s ?? 'all'} type="button" role="radio" aria-checked={statusFilter === s}
            className={statusFilter === s ? 'sc-chip sc-chip-active' : 'sc-chip'}
            onClick={() => setStatusFilter(s)}>{s ?? 'All'}
          </button>
        ))}
      </div>
      <div className="sc-product-grid">
        {projects.map((p) => (
          <Card key={p.id} padding="md" className="sc-project-card">
            <Link to={`${ROUTES.projectDetail.replace(':projectId', p.id)}`}><h3>{p.title}</h3></Link>
            <p className="sc-project-summary">{p.summary || p.body?.slice(0, 120)}</p>
            <p className="sc-project-meta">{p.status} · {p.category}</p>
          </Card>
        ))}
      </div>
      {hasMore && <Button variant="secondary" disabled={loadingMore} onClick={() => void loadMore()}>{loadingMore ? 'Loading…' : 'Load more'}</Button>}
    </>
  );
}

function ProjectsView(): React.ReactElement {
  const [searchParams] = useSearchParams();
  const rawTab = searchParams.get('view');
  const activeTab = rawTab === 'crowdfunding' ? 'crowdfunding' : 'projects';

  return (
    <section className="sc-projects" aria-labelledby="projects-title">
      <header className="sc-projects-heading"><h1 id="projects-title">Projects</h1></header>
      <ProjectsTabBar />
      {activeTab === 'projects' ? <ProjectList /> : <CampaignsList />}
    </section>
  );
}

export function ProjectsPage(): React.ReactElement {
  return (
    <ProjectsProvider>
      <CampaignsProvider>
        <ProjectsView />
      </CampaignsProvider>
    </ProjectsProvider>
  );
}