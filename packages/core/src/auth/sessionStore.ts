import type { AuthSession, UserProfile } from '@supercampus/contracts';
import { create } from 'zustand';

export interface SessionState {
  session: AuthSession | null;
  isHydrated: boolean;
  isLoading: boolean;
  setSession: (session: AuthSession | null) => void;
  setHydrated: (value: boolean) => void;
  setLoading: (value: boolean) => void;
  reset: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  session: null,
  isHydrated: false,
  isLoading: false,
  setSession: (session) => set({ session }),
  setHydrated: (isHydrated) => set({ isHydrated }),
  setLoading: (isLoading) => set({ isLoading }),
  reset: () => set({ session: null, isHydrated: true, isLoading: false }),
}));

export function getCurrentUser(): UserProfile | null {
  return useSessionStore.getState().session?.user ?? null;
}

export function isAuthenticated(): boolean {
  return useSessionStore.getState().session !== null;
}

export function getAccessToken(): string | null {
  return useSessionStore.getState().session?.tokens.accessToken ?? null;
}
