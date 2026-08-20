-- DPDP Act 2023 baseline: records when the user accepted the Privacy Notice.
-- Nullable: users who signed up before this column existed remain un-stamped.
alter table public.profiles add column if not exists privacy_consent_at timestamptz;