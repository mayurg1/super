# Database migrations

This directory is the sole source of truth for schema, RLS policies, storage buckets,
and database functions. Create a timestamped migration with the Supabase CLI; never
change the hosted project manually.

The project is intentionally empty in Phase 3B. The first migration belongs to the
Authentication phase and should also regenerate `packages/supabase/src/database.types.ts`.
