import { createContext, useContext, type ReactElement, type ReactNode } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types.js';

const SupabaseContext = createContext<SupabaseClient<Database> | null>(null);

export interface SupabaseProviderProps {
  client: SupabaseClient<Database>;
  children: ReactNode;
}

export function SupabaseProvider({ client, children }: SupabaseProviderProps): ReactElement {
  return <SupabaseContext.Provider value={client}>{children}</SupabaseContext.Provider>;
}

export function useSupabase(): SupabaseClient<Database> {
  const client = useContext(SupabaseContext);
  if (!client) throw new Error('useSupabase must be used inside SupabaseProvider');
  return client;
}
