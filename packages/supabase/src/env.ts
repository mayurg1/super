import { z } from 'zod';

const rawSupabaseEnvSchema = z.object({
  VITE_SUPABASE_URL: z.string().url().optional(),
  VITE_SUPABASE_ANON_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1).optional(),
});

export const supabaseEnvSchema = z.object({ url: z.string().url(), publishableKey: z.string().min(1) });
export type SupabaseEnv = z.infer<typeof supabaseEnvSchema>;

/** Validates browser-safe configuration without exposing server secrets. */
export function loadSupabaseEnv(raw: Record<string, string | undefined>): SupabaseEnv {
  const source = rawSupabaseEnvSchema.parse({
    VITE_SUPABASE_URL: raw.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: raw.VITE_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SUPABASE_URL: raw.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: raw.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  });
  return supabaseEnvSchema.parse({
    url: source.VITE_SUPABASE_URL ?? source.NEXT_PUBLIC_SUPABASE_URL,
    publishableKey: source.VITE_SUPABASE_ANON_KEY ?? source.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  });
}
