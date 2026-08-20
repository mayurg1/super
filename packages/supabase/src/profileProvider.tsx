import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactElement, type ReactNode } from 'react';
import { createProfileService, PRIVACY_CONSENT_STORAGE_KEY, type Profile, type ProfileUpdate } from './profile.js';
import { useAuth } from './authProvider.js';
import { useSupabase } from './provider.js';

export interface ProfileContextValue {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  exists: boolean;
  isFirstLogin: boolean;
  refreshProfile: () => Promise<void>;
  updateProfile: (changes: ProfileUpdate) => Promise<boolean>;
}
const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }): ReactElement {
  const { user, authenticated } = useAuth();
  const client = useSupabase();
  const service = useMemo(() => createProfileService(client), [client]);
  const [profile, setProfile] = useState<Profile | null>(null); const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const load = useCallback(async (): Promise<void> => {
    if (!user) { setProfile(null); return; }
    setLoading(true);
    const result = await service.bootstrap(user);
    let final = result;
    // DPDP consent: stamp the profile the moment it exists for a consenting signup.
    if (result.data && !result.data.privacy_consent_at && localStorage.getItem(PRIVACY_CONSENT_STORAGE_KEY) === '1') {
      localStorage.removeItem(PRIVACY_CONSENT_STORAGE_KEY);
      const stamped = await service.update(user.id, { privacy_consent_at: new Date().toISOString() });
      if (stamped.data) final = stamped;
    }
    setProfile(final.data); setError(final.error); setLoading(false);
  }, [service, user]);
  useEffect(() => { if (!authenticated || !user) { setProfile(null); setLoading(false); return; } void load(); }, [authenticated, user, load]);
  const value = useMemo<ProfileContextValue>(() => ({
    profile, loading, exists: profile !== null,
    isFirstLogin: profile !== null && profile.campus_id === null,
    refreshProfile: async () => { await load(); },
    updateProfile: async (changes) => { if (!user) return false; const result = await service.update(user.id, changes); if (result.data) { setProfile(result.data); return true; } return false; },
    error,
  }), [profile, loading, user, service, load, error]);
  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile(): ProfileContextValue {
  const value = useContext(ProfileContext);
  if (!value) throw new Error('useProfile must be used inside ProfileProvider');
  return value;
}
