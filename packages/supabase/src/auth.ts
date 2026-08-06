import type { Session, User } from '@supabase/supabase-js';
import type { SupercampusSupabaseClient } from './client.js';

export interface AuthCredentials { email: string; password: string }
export type AuthResult<T> = { data: T; error: null } | { data: null; error: string };

function message(error: { message: string; status?: number }): string {
  if (error.message.includes('Invalid login credentials')) return 'Incorrect email or password.';
  if (error.message.includes('already registered')) return 'An account already exists for this email.';
  if (error.message.includes('Password should')) return 'Password must be at least 6 characters long.';
  if (error.status === 429) return 'Too many attempts. Please try again later.';
  return 'Unable to complete that request. Please try again.';
}

export function createAuthService(client: SupercampusSupabaseClient) {
  return {
    async signUp({ email, password }: AuthCredentials): Promise<AuthResult<Session | null>> {
      const { data, error } = await client.auth.signUp({ email, password });
      return error ? { data: null, error: message(error) } : { data: data.session, error: null };
    },
    async signIn({ email, password }: AuthCredentials): Promise<AuthResult<Session>> {
      const { data, error } = await client.auth.signInWithPassword({ email, password });
      return error ? { data: null, error: message(error) } : { data: data.session, error: null };
    },
    async signOut(): Promise<AuthResult<null>> {
      const { error } = await client.auth.signOut();
      return error ? { data: null, error: message(error) } : { data: null, error: null };
    },
    async resetPassword(email: string): Promise<AuthResult<null>> {
      const { error } = await client.auth.resetPasswordForEmail(email);
      return error ? { data: null, error: message(error) } : { data: null, error: null };
    },
    async updatePassword(password: string): Promise<AuthResult<User>> {
      const { data, error } = await client.auth.updateUser({ password });
      return error ? { data: null, error: message(error) } : { data: data.user, error: null };
    },
    async getCurrentSession(): Promise<Session | null> { const { data } = await client.auth.getSession(); return data.session; },
    async getCurrentUser(): Promise<User | null> { const { data } = await client.auth.getUser(); return data.user; },
  };
}

export type SupabaseAuthService = ReturnType<typeof createAuthService>;
