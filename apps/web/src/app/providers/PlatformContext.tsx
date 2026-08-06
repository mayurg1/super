import { createContext, useContext, useMemo } from 'react';
import type { ApiClient } from '@supercampus/api-client';
import type { PlatformEventBus } from '@supercampus/core';
import type { ClientEnv } from '@supercampus/core';
import type { Database, SupabaseClient } from '@supercampus/supabase';

export interface PlatformContextValue {
  env: ClientEnv;
  eventBus: PlatformEventBus;
  apiClient: ApiClient;
  supabase: SupabaseClient<Database>;
}

const PlatformContext = createContext<PlatformContextValue | null>(null);

export interface PlatformProviderProps {
  value: PlatformContextValue;
  children: React.ReactNode;
}

export function PlatformProvider({ value, children }: PlatformProviderProps): React.ReactElement {
  const memo = useMemo(() => value, [value]);
  return <PlatformContext.Provider value={memo}>{children}</PlatformContext.Provider>;
}

export function usePlatform(): PlatformContextValue {
  const ctx = useContext(PlatformContext);
  if (!ctx) {
    throw new Error('usePlatform must be used within PlatformProvider');
  }
  return ctx;
}
