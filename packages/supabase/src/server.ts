import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';
import type { Database } from './database.types.js';

const serverEnvSchema = z.object({
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
});

export type ServerSupabaseEnv = z.infer<typeof serverEnvSchema>;
export type ServerSupabaseClient = SupabaseClient<Database>;

/** Server-only configuration. Never import this entry point into browser code. */
export function loadServerSupabaseEnv(raw: Record<string, string | undefined>): ServerSupabaseEnv {
  return serverEnvSchema.parse({
    SUPABASE_URL: raw.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: raw.SUPABASE_SERVICE_ROLE_KEY,
  });
}

/** Creates a stateless server client for trusted jobs, webhooks, and Edge Functions. */
export function createServerSupabaseClient(env: ServerSupabaseEnv): ServerSupabaseClient {
  return createClient<Database>(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  });
}
