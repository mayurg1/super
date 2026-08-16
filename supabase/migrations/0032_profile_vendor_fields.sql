-- Additional onboarding fields for Vendor role (and future phone-based contact info).
-- Nullable, no constraints: these are optional free-text contact fields.
alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists business_name text;
