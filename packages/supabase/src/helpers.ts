import { isAuthError, type AuthError, type PostgrestError } from '@supabase/supabase-js';

export type SupabaseError = AuthError | PostgrestError;
export function isSupabaseError(error: unknown): error is SupabaseError {
  return isAuthError(error) || isPostgrestError(error);
}

function isPostgrestError(error: unknown): error is PostgrestError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'details' in error &&
    'hint' in error &&
    'message' in error
  );
}
