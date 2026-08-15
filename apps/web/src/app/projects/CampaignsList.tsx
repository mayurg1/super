import { Link } from 'react-router-dom';
import { ROUTES } from '@supercampus/core';
import { Button, Card, EmptyState, Spinner } from '@supercampus/shared';
import { useCampaigns } from './CampaignsContext';

export function CampaignsList(): React.ReactElement {
  const { campaigns, loading, loadingMore, error, hasMore, loadMore, refresh } = useCampaigns();

  if (loading) return <Spinner label="Loading campaigns" />;
  if (error && campaigns.length === 0)
    return (
      <EmptyState
        title="Could not load campaigns"
        description={error}
        action={<Button variant="primary" onClick={() => void refresh()}>Try again</Button>}
      />
    );
  if (campaigns.length === 0)
    return (
      <EmptyState
        title="No active campaigns"
        description="There are no crowdfunding campaigns running right now."
      />
    );

  function daysRemaining(campaign: { endsAt: string; status: string }): number | null {
    if (campaign.status !== 'active') return null;
    const remaining = Math.ceil((new Date(campaign.endsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return remaining;
  }

  return (
    <div className="sc-product-grid">
      {campaigns.map((c) => {
        const pct = c.goalAmount > 0 ? Math.round((c.raisedTotal / c.goalAmount) * 100) : 0;
        const daysLeft = daysRemaining(c);
        return (
          <Card key={c.id} padding="md" className="sc-campaign-card">
            <Link to={`${ROUTES.projectDetail.replace(':projectId', c.projectId)}`}>
              <h3>{c.projectTitle || 'Untitled project'}</h3>
            </Link>
            <p className="sc-project-summary">{c.projectSummary}</p>
            <div className="sc-campaign-meta">
              <span className="sc-campaign-status">{c.status}</span>
              <span className="sc-campaign-category">{c.projectCategory}</span>
            </div>
            <div className="sc-campaign-progress">
              <div className="sc-campaign-bar" style={{ width: `${Math.min(pct, 100)}%` }} />
            </div>
            <p className="sc-project-meta">
              Raised {c.raisedTotal} {c.currency} of {c.goalAmount} {c.currency} ({pct}%) · {c.contributorCount} contributor(s)
              {daysLeft !== null && ` · ${daysLeft} day(s) left`}
            </p>
            <Link to={`${ROUTES.projectDetail.replace(':projectId', c.projectId)}`}>
              <Button variant="primary" size="sm">View campaign</Button>
            </Link>
          </Card>
        );
      })}
      {hasMore && (
        <Button variant="secondary" disabled={loadingMore} onClick={() => void loadMore()}>
          {loadingMore ? 'Loading…' : 'Load more'}
        </Button>
      )}
    </div>
  );
}