import { Button, Card } from '@supercampus/shared';
import type { ProjectMemberProfile } from '@supercampus/supabase';

export function ProjectMembersList({ members, ownerId, viewerId, onJoin, onRespond, viewerStatus }: {
  members: readonly ProjectMemberProfile[];
  ownerId: string;
  viewerId: string | undefined;
  viewerStatus: string | null;
  onJoin: () => Promise<boolean>;
  onRespond: (userId: string, status: string) => Promise<boolean>;
}): React.ReactElement {
  const isOwner = viewerId === ownerId;
  return (
    <Card padding="md" className="sc-project-members">
      <h3>Team ({members.length})</h3>
      {members.map((m) => (
        <div key={m.userId} className="sc-project-member">
          <span>{m.displayName} (@{m.handle})</span>
          <span className="sc-project-meta">{m.memberRole} · {m.memberStatus}</span>
          {isOwner && m.memberStatus === 'requested' && (
            <div className="sc-product-actions">
              <Button size="sm" variant="primary" onClick={() => void onRespond(m.userId, 'active')}>Approve</Button>
              <Button size="sm" variant="ghost" onClick={() => void onRespond(m.userId, 'rejected')}>Reject</Button>
            </div>
          )}
        </div>
      ))}
      {!isOwner && viewerId && (
        viewerStatus === null ? <Button size="sm" variant="outline" onClick={() => void onJoin()}>Request to join</Button>
        : viewerStatus === 'requested' ? <span className="sc-project-meta">Request pending</span>
        : viewerStatus === 'active' ? <span className="sc-project-meta">✓ Member</span>
        : viewerStatus === 'rejected' ? <span className="sc-project-meta">✕ Request declined</span>
        : null
      )}
    </Card>
  );
}