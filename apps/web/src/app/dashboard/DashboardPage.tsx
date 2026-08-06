import { Link } from 'react-router-dom';
import { Card } from '@supercampus/shared';
import { useProfile, useRoles } from '@supercampus/supabase';
import { useDashboard } from './DashboardProvider';

export function DashboardCard({ title, children }: { title: string; children: React.ReactNode }): React.ReactElement { return <Card padding="md" className="sc-dashboard-card"><h2>{title}</h2>{children}</Card>; }
export function DashboardSection({ title, children }: { title: string; children: React.ReactNode }): React.ReactElement { return <section className="sc-dashboard-section" aria-label={title}><h2>{title}</h2>{children}</section>; }
export function DashboardLayout({ children }: { children: React.ReactNode }): React.ReactElement { return <div className="sc-dashboard">{children}</div>; }

export function DashboardPage(): React.ReactElement {
  const { profile } = useProfile(); const roles = useRoles(); const { sections } = useDashboard();
  return <DashboardLayout>
    <DashboardCard title={`Welcome back, ${profile?.display_name ?? 'there'}`}><p>Here is your campus workspace at a glance.</p><p className="sc-dashboard-muted">{roles.map((role) => role.name).join(' · ') || 'Profile setup in progress'}</p></DashboardCard>
    <DashboardSection title="Profile summary"><DashboardCard title="Your campus identity"><p>{profile?.handle ? `@${profile.handle}` : 'Profile unavailable'}</p><p className="sc-dashboard-muted">Campus and organization details will appear here.</p></DashboardCard></DashboardSection>
    {sections.map((section) => <DashboardSection key={section.id} title={section.title}>{section.items.length ? <div className="sc-dashboard-actions">{section.items.map((item) => <Link key={item.id} className="sc-dashboard-action" to={item.route}><span aria-hidden="true">{item.icon}</span><span>{item.title}</span></Link>)}</div> : <DashboardCard title="Nothing pinned yet"><p className="sc-dashboard-muted">Enabled modules will appear here automatically.</p></DashboardCard>}</DashboardSection>)}
    <div className="sc-dashboard-grid"><DashboardCard title="Recently used"><p className="sc-dashboard-muted">Recent activity will appear when modules are connected.</p></DashboardCard><DashboardCard title="Announcements"><p className="sc-dashboard-muted">Campus announcements will appear here.</p></DashboardCard><DashboardCard title="Campus updates"><p className="sc-dashboard-muted">Updates will appear here.</p></DashboardCard><DashboardCard title="Statistics"><p className="sc-dashboard-muted">Your statistics will appear here.</p></DashboardCard></div>
  </DashboardLayout>;
}
