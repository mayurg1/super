import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMemo } from 'react';
import { createApiClient } from '@supercampus/api-client';
import {
  createPlatformEventBus,
  getAccessToken,
  loadClientEnv,
} from '@supercampus/core';
import { ThemeProvider } from '@supercampus/shared';
import { AuthorizationProvider, AuthProvider, ProfileProvider, RoleRequestsProvider, SupabaseProvider, createBrowserSupabaseClient, loadSupabaseEnv } from '@supercampus/supabase';
import { PlatformProvider } from './PlatformContext';
import { ApplicationProvider } from './ApplicationProvider';
import { NavigationProvider } from '../navigation/NavigationProvider';
import { DashboardProvider } from '../dashboard/DashboardProvider';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps): React.ReactElement {
  const platform = useMemo(() => {
    const env = loadClientEnv(import.meta.env as Record<string, string | undefined>);
    const supabaseEnv = loadSupabaseEnv(import.meta.env as Record<string, string | undefined>);
    const supabase = createBrowserSupabaseClient(supabaseEnv);
    const eventBus = createPlatformEventBus();

    const apiClient = createApiClient({
      baseUrl: env.VITE_BFF_URL || 'http://localhost:5500/api/v1',
      getAccessToken,
    });

    return { env, eventBus, apiClient, supabase };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <SupabaseProvider client={platform.supabase}>
        <AuthProvider>
          <ProfileProvider>
            <AuthorizationProvider><RoleRequestsProvider><ApplicationProvider><NavigationProvider><DashboardProvider><PlatformProvider value={platform}>
              <ThemeProvider onThemeChange={(theme) => platform.eventBus.emit('theme:changed', { theme })}>{children}</ThemeProvider>
            </PlatformProvider></DashboardProvider></NavigationProvider></ApplicationProvider></RoleRequestsProvider></AuthorizationProvider>
          </ProfileProvider>
        </AuthProvider>
      </SupabaseProvider>
    </QueryClientProvider>
  );
}
