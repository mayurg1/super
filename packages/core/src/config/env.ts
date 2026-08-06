import { z } from 'zod';

export const clientEnvSchema = z.object({
  VITE_APP_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  VITE_BFF_URL: z.string().url().or(z.literal('')).default(''),
});

export type ClientEnv = z.infer<typeof clientEnvSchema>;

export function loadClientEnv(raw: Record<string, string | undefined>): ClientEnv {
  const parsed = clientEnvSchema.safeParse({
    VITE_APP_ENV: raw.VITE_APP_ENV,
    VITE_BFF_URL: raw.VITE_BFF_URL,
  });

  if (!parsed.success) {
    console.warn('[supercampus/config] Invalid client env — using defaults', parsed.error.flatten());
    return clientEnvSchema.parse({});
  }

  return parsed.data;
}

export const THEME_STORAGE_KEY = 'sc_theme';
