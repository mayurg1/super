import type { PlatformEventBus } from '../events/eventBus.js';
import { getAuthProvider } from './authProvider.js';
import { useSessionStore } from './sessionStore.js';

export interface AuthServiceDeps {
  eventBus: PlatformEventBus;
}

export function createAuthService(deps: AuthServiceDeps) {
  const { eventBus } = deps;

  return {
    async hydrate(): Promise<void> {
      const store = useSessionStore.getState();
      store.setLoading(true);
      try {
        const provider = getAuthProvider();
        const session = await provider.hydrateSession();
        store.setSession(session);
        if (session) {
          eventBus.emit('auth:signed_in', { userId: session.user.userId });
        }
      } finally {
        store.setLoading(false);
        store.setHydrated(true);
      }
    },

    async signOut(): Promise<void> {
      const provider = getAuthProvider();
      await provider.signOut();
      useSessionStore.getState().reset();
      eventBus.emit('auth:signed_out', undefined);
    },
  };
}

export type AuthService = ReturnType<typeof createAuthService>;
