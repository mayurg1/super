import { useCallback, useEffect, useState } from 'react';
import { Spinner } from '@supercampus/shared';
import { ProfileCard } from './ProfileCard';
import { createDirectoryService, useAuth, useSupabase, type DirectoryProfile } from '@supercampus/supabase';

export function StudentsList({ search }: { search: string }): React.ReactElement {
  const client = useSupabase(); const { user } = useAuth();
  const svc = useCallback(() => createDirectoryService(client), [client]);
  const [profiles, setProfiles] = useState<DirectoryProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let a = true; setLoading(true);
    void svc().getPeopleByRole('student', {}).then((r) => { if (!a) return; setLoading(false); if (r.data) setProfiles(r.data.profiles); });
    return () => { a = false; };
  }, [svc, user]);

  const q = search.toLowerCase();
  const filtered = profiles.filter((p) => { return (p.displayName || '').toLowerCase().includes(q); });

  if (loading) return <Spinner label="Loading students" />;
  if (filtered.length === 0) return <p className="sc-connect-empty">No students found.</p>;
  return <div className="sc-connect-grid">{filtered.map((p) => <ProfileCard key={p.id} profile={p} />)}</div>;
}
