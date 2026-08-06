# Supabase workflow

The hosted SUPERCAMPUS project starts empty. Apply all changes through migrations:

1. Authenticate the Supabase CLI using an environment variable or local CLI login.
2. Link the existing project: `supabase link --project-ref <project-ref>`.
3. Create changes with `supabase migration new <name>`.
4. Review the generated SQL, then deploy with `supabase db push`.
5. Regenerate TypeScript types after schema changes and replace the empty `Database` type.

Do not create tables, buckets, policies, or data through the dashboard. Client code reads
only browser-safe public variables (`VITE_SUPABASE_*` or legacy `NEXT_PUBLIC_SUPABASE_*`).
Server-only database credentials must never be exposed to Vite.
