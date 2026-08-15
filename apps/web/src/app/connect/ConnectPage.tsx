import { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Input, Spinner } from '@supercampus/shared';
import { useSupabase, useAuth } from '@supercampus/supabase';
import { createDirectoryService, type DirectoryProfile } from '@supercampus/supabase';
import { createJobService, type JobResult } from '@supercampus/supabase';
import { createEventService, type EventResult } from '@supercampus/supabase';
import { ConnectionRequestsCard } from './ConnectionRequestsCard';
import { ConnectTabBar } from './ConnectTabBar';
import { BatchFilterChips } from './BatchFilterChips';
import { ProfileCard } from './ProfileCard';

const BATCHES = [
  { value: '', label: 'All Batches' },
  { value: '2020', label: '2020' },
  { value: '2021', label: '2021' },
  { value: '2022', label: '2022' },
  { value: '2023', label: '2023' },
];

function TabContent({ tab, search, batch }: {
  tab: string; search: string; batch: string | null;
}): React.ReactElement | null {
  const client = useSupabase();
  const { user } = useAuth();
  const dirSvc = useCallback(() => createDirectoryService(client), [client]);
  const jobSvc = useCallback(() => createJobService(client), [client]);
  const eventSvc = useCallback(() => createEventService(client), [client]);
  const [dirProfiles, setDirProfiles] = useState<DirectoryProfile[]>([]);
  const [jobs, setJobs] = useState<JobResult[]>([]);
  const [events, setEvents] = useState<EventResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let a = true;
    setLoading(true);
    if (tab === 'alumni') {
      void dirSvc().getPeopleByRole('alumni', {}).then((r) => { if (a) { setLoading(false); if (r.data) setDirProfiles(r.data.profiles); } });
    } else if (tab === 'students') {
      void dirSvc().getPeopleByRole('student', {}).then((r) => { if (a) { setLoading(false); if (r.data) setDirProfiles(r.data.profiles); } });
    } else if (tab === 'faculty') {
      void dirSvc().getPeopleByRole('faculty', {}).then((r) => { if (a) { setLoading(false); if (r.data) setDirProfiles(r.data.profiles); } });
    } else if (tab === 'jobs') {
      void jobSvc().getJobs({}).then((r) => { if (a) { setLoading(false); if (r.data) setJobs(r.data.jobs); } });
    } else if (tab === 'events') {
      void eventSvc().getEvents({}).then((r) => { if (a) { setLoading(false); if (r.data) setEvents(r.data.events); } });
    }
    return () => { a = false; };
  }, [tab, user, dirSvc, jobSvc, eventSvc]);

  const q = search.toLowerCase();

  if (loading) return <Spinner label="Loading…" />;

  if (tab === 'jobs') {
    const filtered = jobs.filter((j) => !q || j.title.toLowerCase().includes(q) || j.employer.toLowerCase().includes(q));
    if (filtered.length === 0) return <p className="sc-connect-empty">No jobs found.</p>;
    return (
      <div className="sc-product-grid">
        {filtered.map((j) => (
          <div key={j.id} className="sc-connect-profile-card">
            <div style={{ fontWeight: 600 }}>{j.title}</div>
            <div style={{ fontSize: 13, color: 'var(--sc-text-secondary)' }}>{j.employer} · {j.location || 'On-campus'}</div>
          </div>
        ))}
      </div>
    );
  }

  if (tab === 'events') {
    const filtered = events.filter((e) => !q || e.title.toLowerCase().includes(q) || e.venue.toLowerCase().includes(q));
    if (filtered.length === 0) return <p className="sc-connect-empty">No events found.</p>;
    return (
      <div className="sc-product-grid">
        {filtered.map((e) => (
          <div key={e.id} className="sc-connect-profile-card">
            <div style={{ fontWeight: 600 }}>{e.title}</div>
            <div style={{ fontSize: 13, color: 'var(--sc-text-secondary)' }}>{e.venue} · {new Date(e.startsAt).toLocaleDateString()} ({e.registrationCount} registered)</div>
          </div>
        ))}
      </div>
    );
  }

  // Directory tabs
  const filtered = dirProfiles.filter((p) => {
    if (batch && tab === 'alumni' && p.graduationYear && String(p.graduationYear) !== batch) return false;
    if (q && !(p.displayName || '').toLowerCase().includes(q)) return false;
    return true;
  });
  if (filtered.length === 0) return <p className="sc-connect-empty">No {tab} found.</p>;
  return <div className="sc-connect-grid">{filtered.map((p) => <ProfileCard key={p.id} profile={p} />)}</div>;
}

export function ConnectPage({ initialTab }: { initialTab?: string }): React.ReactElement {
  const loc = useLocation();
  const [activeTab, setActiveTab] = useState(() => {
    if (initialTab) return initialTab;
    const fromPath = loc.pathname.split('/').pop() || '';
    if (['alumni', 'students', 'faculty', 'jobs', 'events'].includes(fromPath)) return fromPath;
    return 'alumni';
  });
  const [search, setSearch] = useState('');
  const [batch, setBatch] = useState<string | null>(null);
  const placeholders: Record<string, string> = {
    alumni: 'Search alumni by name…',
    students: 'Search students by name…',
    faculty: 'Search faculty by name…',
    jobs: 'Search jobs by title or company…',
    events: 'Search events…',
  };
  return (
    <div className="sc-connect">
      <ConnectionRequestsCard />
      <ConnectTabBar activeTab={activeTab} onTabChange={(t) => { setActiveTab(t); setSearch(''); setBatch(null); }} />
      <div className="sc-connect-search-row">
        <Input placeholder={placeholders[activeTab] || 'Search…'} value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      {activeTab === 'alumni' && <BatchFilterChips options={BATCHES} active={batch} onChange={setBatch} />}
      <TabContent key={activeTab} tab={activeTab} search={search} batch={batch} />
    </div>
  );
}