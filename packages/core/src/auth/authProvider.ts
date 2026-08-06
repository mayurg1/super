import type { AuthSession, UserProfile } from '@supercampus/contracts';

/** Credentials for sign-in / sign-up — no business logic here. */
export interface SignInCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials extends SignInCredentials {
  name: string;
}

/**
 * Auth provider port — implemented by infrastructure (Supabase adapter in Phase 4).
 * Foundation exposes the interface only.
 */
export interface AuthProvider {
  hydrateSession(): Promise<AuthSession | null>;
  signIn(credentials: SignInCredentials): Promise<AuthSession>;
  signUp(credentials: SignUpCredentials): Promise<AuthSession | null>;
  signOut(): Promise<void>;
  getProfile(): Promise<UserProfile | null>;
}

export type AuthProviderFactory = () => AuthProvider;

let authProvider: AuthProvider | null = null;

export function registerAuthProvider(provider: AuthProvider): void {
  authProvider = provider;
}

export function getAuthProvider(): AuthProvider {
  if (!authProvider) {
    throw new Error('AuthProvider not registered. Call registerAuthProvider() at app bootstrap.');
  }
  return authProvider;
}

/** No-op stub for foundation — replaced when Supabase adapter lands. */
export function createStubAuthProvider(): AuthProvider {
  return {
    async hydrateSession() {
      return null;
    },
    async signIn() {
      throw new Error('Auth not configured');
    },
    async signUp() {
      throw new Error('Auth not configured');
    },
    async signOut() {
      /* no-op */
    },
    async getProfile() {
      return null;
    },
  };
}
