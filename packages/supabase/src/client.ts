import { createClient, type SupabaseClient, type SupabaseClientOptions } from '@supabase/supabase-js';
import type { Database } from './database.types.js';
import type { SupabaseEnv } from './env.js';

export type { SupabaseClient } from '@supabase/supabase-js';

export type SupercampusSupabaseClient = SupabaseClient<Database>;

const browserClientOptions: SupabaseClientOptions<'public'> = {
  auth: {
    autoRefreshToken: true,
    detectSessionInUrl: true,
    persistSession: true,
  },
};

let browserClient: SupercampusSupabaseClient | undefined;

export function createSupabaseClient(
  env: SupabaseEnv,
  options?: SupabaseClientOptions<'public'>,
): SupercampusSupabaseClient {
  return createClient<Database>(env.url, env.publishableKey, options);
}

/** Returns the one browser client instance used by the application shell. */
export function createBrowserSupabaseClient(env: SupabaseEnv): SupercampusSupabaseClient {
  browserClient ??= createSupabaseClient(env, browserClientOptions);
  return browserClient;
}
