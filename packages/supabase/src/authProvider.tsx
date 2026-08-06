import { createContext, useContext, useEffect, useMemo, useState, type ReactElement, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { createAuthService, type AuthCredentials, type SupabaseAuthService } from './auth.js';
import { useSupabase } from './provider.js';

export interface AuthContextValue extends SupabaseAuthService { user: User | null; session: Session | null; loading: boolean; authenticated: boolean }
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }): ReactElement {
  const client = useSupabase();
  const service = useMemo(() => createAuthService(client), [client]);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let alive = true;
    void service.getCurrentSession().then((current) => { if (alive) { setSession(current); setLoading(false); } });
    const { data: { subscription } } = client.auth.onAuthStateChange((_event, nextSession) => { if (alive) { setSession(nextSession); setLoading(false); } });
    return () => { alive = false; subscription.unsubscribe(); };
  }, [client, service]);
  const value = useMemo<AuthContextValue>(() => ({ ...service, user: session?.user ?? null, session, loading, authenticated: session !== null }), [service, session, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}

export type { AuthCredentials };
