-- ---------------------------------------------------------------------------
-- 0029 Profile skills self-service insert
-- ---------------------------------------------------------------------------
-- WHY: The skills catalog (0004) only exposes `skills_read` (SELECT) and
-- `profile_skills_owner` for the join row; there is NO INSERT policy on
-- `public.skills`. The profile page's "add a skill" experience therefore could
-- only link pre-seeded tags. This additive policy lets any authenticated user
-- create a new skill tag (name-only; citext unique, no category). Unique
-- conflicts are handled on the client by look-up-then-insert.
CREATE POLICY skills_insert
  on public.skills
  for insert to authenticated
  with check (name is not null and length(trim(name)) > 0);