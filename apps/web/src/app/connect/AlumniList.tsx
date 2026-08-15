import { useCallback, useEffect, useState } from 'react';
import { Spinner } from '@supercampus/shared';
import { ProfileCard } from './ProfileCard';
import { createDirectoryService, useAuth, useSupabase, type DirectoryProfile } from '@supercampus/supabase';

export function AlumniList({ search, batch }: { search: string; batch: string | null }): React.ReactElement {
  const client = useSupabase();
  const { user } = useAuth();
  const svc = useCallback(() => createDirectoryService(client), [client]);
  const [profiles, setProfiles] = useState<DirectoryProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let active = true;
    setLoading(true);
    void svc().getPeopleByRole('alumni', {}).then((r) => {
      if (!active) return;
      setLoading(false);
      if (r.data) setProfiles(r.data.profiles);
    });
    return () => { active = false; };
  }, [svc, user]);

  const q = search.toLowerCase();
  const filtered = profiles.filter((p) => {
    if (batch && p.graduationYear && String(p.graduationYear) !== batch) return false;
    if (q && !(p.displayName || '').toLowerCase().includes(q)) return false;
    return true;
  });

  if (loading) return <Spinner label="Loading alumni" />;
  if (filtered.length === 0) return <p className="sc-connect-empty">No alumni found.</p>;
  return <div className="sc-connect-grid">{filtered.map((p) => <ProfileCard key={p.id} profile={p} />)}</div>;
}