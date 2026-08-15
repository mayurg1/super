import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ROUTES } from '@supercampus/core';
import { Button, EmptyState, Spinner } from '@supercampus/shared';
import { createProjectService, type ProjectDetail, useAuth, useSupabase } from '@supercampus/supabase';
import { ProjectMembersList } from './ProjectMembersList';
import { CampaignSection } from './CampaignSection';

export function ProjectDetailPage(): React.ReactElement {
  const { projectId } = useParams<{ projectId: string }>();
  const client = useSupabase();
  const { user } = useAuth();
  const svc = useCallback(() => createProjectService(client), [client]);
  const [detail, setDetail] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewerMemberStatus, setViewerMemberStatus] = useState<string | null>(null);
  const [joinMsg, setJoinMsg] = useState<string | null>(null);
  const [respondMsg, setRespondMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId || !user) return;
    let active = true;
    setLoading(true);
    void svc().getProject(projectId).then((r) => { if (active) { setLoading(false); if (r.data) setDetail(r.data); else setError(r.error ?? 'Project not found.'); } });
    // viewer's membership
    void client.from('project_members').select('status').eq('project_id', projectId).eq('user_id', user.id).limit(1).maybeSingle().then((r) => { if (active && r.data) setViewerMemberStatus((r.data as { status: string }).status); });
    return () => { active = false; };
  }, [client, projectId, svc, user]);

  const join = useCallback(async () => {
    if (!user || !projectId) return false;
    const r = await svc().requestToJoin(projectId, user.id);
    if (r.error) setJoinMsg(r.error); else { setJoinMsg(null); setViewerMemberStatus('requested'); }
    return !r.error;
  }, [projectId, svc, user]);

  const respond = useCallback(async (memberUserId: string, status: string): Promise<boolean> => {
    if (!projectId) return false;
    const r = await svc().respondToMember(projectId, memberUserId, status);
    if (r.error) { setRespondMsg(r.error); return false; }
    setRespondMsg(null); void svc().getProject(projectId).then((res) => { if (res.data) setDetail(res.data); });
    return true;
  }, [projectId, svc]);

  if (loading) return <Spinner label="Loading project" />;
  if (error || !detail) {
    return <EmptyState icon="🚀" title="Project not found" description={error ?? 'This project could not be loaded.'} action={<Link to={ROUTES.projects}><Button variant="outline">Back to Projects</Button></Link>} />;
  }

  const { project, members, skills } = detail;
  const isOwner = user?.id === project.ownerId;

  return (
    <section className="sc-project-detail" aria-labelledby="project-detail-title">
      <p><Link to={ROUTES.projects}>← Back to Projects</Link></p>
      <header><h1 id="project-detail-title">{project.title}</h1><span className="sc-product-status">{project.status}</span></header>
      <p className="sc-project-summary">{project.summary || project.body}</p>
      {skills.length > 0 && <p className="sc-project-meta">Skills: {skills.map((s) => s.skillName).join(', ')}</p>}
      <ProjectMembersList members={members} ownerId={project.ownerId} viewerId={user?.id} viewerStatus={viewerMemberStatus} onJoin={join} onRespond={respond} />
      {joinMsg && <p className="sc-product-muted" role="alert">{joinMsg}</p>}
      {respondMsg && <p className="sc-product-muted" role="alert">{respondMsg}</p>}
      <CampaignSection projectId={project.id} isCreator={isOwner} />
    </section>
  );
}