import { z } from 'zod';

const rawSupabaseEnvSchema = z.object({
  VITE_SUPABASE_URL: z.string().url().optional(),
  VITE_SUPABASE_ANON_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1).optional(),
});

export const supabaseEnvSchema = z.object({ url: z.string().url(), publishableKey: z.string().min(1) });
export type SupabaseEnv = z.infer<typeof supabaseEnvSchema>;

/**
 * Validates browser-safe configuration without exposing server secrets.
 *
 * The env file (`.env`) is git-ignored, so the URL/key may be absent (e.g. on a
 * fresh checkout). Never throw here: a throw during app bootstrap collapses the
 * whole tree into a blank screen. Instead, degrade to a local placeholder so the
 * application still mounts and reaches the Login page; real auth simply won't be
 * usable until the env is configured.
 */
export function loadSupabaseEnv(raw: Record<string, string | undefined>): SupabaseEnv {
  const source = rawSupabaseEnvSchema.parse({
    VITE_SUPABASE_URL: raw.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: raw.VITE_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SUPABASE_URL: raw.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: raw.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  });
  const url = source.VITE_SUPABASE_URL ?? source.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = source.VITE_SUPABASE_ANON_KEY ?? source.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (url && publishableKey) {
    return supabaseEnvSchema.parse({ url, publishableKey });
  }
  console.warn('[supercampus/supabase] Supabase URL/key missing — using placeholder; auth features disabled.');
  return { url: 'http://localhost:54321', publishableKey: 'sb_placeholder_invalid_key_0000000000000' };
}
