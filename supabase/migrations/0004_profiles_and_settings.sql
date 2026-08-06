create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade, campus_id uuid references public.campuses(id) on delete restrict,
  department_id uuid references public.departments(id) on delete set null, program_id uuid references public.programs(id) on delete set null,
  handle citext not null unique, display_name text not null, given_name text, family_name text, bio text not null default '',
  graduation_year smallint, avatar_asset_id uuid, directory_visibility text not null default 'campus', is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()), updated_at timestamptz not null default timezone('utc', now()), deleted_at timestamptz,
  constraint profiles_handle_format check (handle::text ~ '^[a-z0-9][a-z0-9_.-]{2,31}$'),
  constraint profiles_visibility check (directory_visibility in ('private','campus','public')),
  constraint profiles_graduation_year check (graduation_year is null or graduation_year between 1950 and 2200)
);
create table public.profile_educations (
  id uuid primary key default gen_random_uuid(), profile_id uuid not null references public.profiles(id) on delete cascade,
  institution text not null, program text not null, started_on date, ended_on date, created_at timestamptz not null default timezone('utc', now()), updated_at timestamptz not null default timezone('utc', now()),
  constraint profile_education_dates check (ended_on is null or started_on is null or ended_on >= started_on)
);
create table public.profile_experiences (
  id uuid primary key default gen_random_uuid(), profile_id uuid not null references public.profiles(id) on delete cascade,
  employer text not null, title text not null, started_on date, ended_on date, is_current boolean not null default false, visibility text not null default 'public',
  created_at timestamptz not null default timezone('utc', now()), updated_at timestamptz not null default timezone('utc', now()),
  constraint profile_experience_dates check (ended_on is null or started_on is null or ended_on >= started_on),
  constraint profile_experience_visibility check (visibility in ('private','campus','public'))
);
create table public.skills (id uuid primary key default gen_random_uuid(), name citext not null unique, category text, created_at timestamptz not null default timezone('utc', now()), updated_at timestamptz not null default timezone('utc', now()));
create table public.profile_skills (profile_id uuid not null references public.profiles(id) on delete cascade, skill_id uuid not null references public.skills(id) on delete restrict, proficiency smallint, created_at timestamptz not null default timezone('utc', now()), primary key(profile_id, skill_id), constraint profile_skills_proficiency check (proficiency between 1 and 5));
create table public.user_settings (user_id uuid primary key references public.profiles(id) on delete cascade, theme text not null default 'system', locale text not null default 'en', email_notifications boolean not null default true, push_notifications boolean not null default true, preferences jsonb not null default '{}'::jsonb, created_at timestamptz not null default timezone('utc', now()), updated_at timestamptz not null default timezone('utc', now()), constraint user_settings_theme check (theme in ('system','light','dark')), constraint user_settings_preferences_object check (jsonb_typeof(preferences) = 'object'));
create index profiles_campus_id_idx on public.profiles(campus_id) where deleted_at is null;
create index profiles_department_id_idx on public.profiles(department_id) where deleted_at is null;
create index profile_educations_profile_id_idx on public.profile_educations(profile_id);
create index profile_experiences_profile_id_idx on public.profile_experiences(profile_id);
create index profile_skills_skill_id_idx on public.profile_skills(skill_id);
create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger profile_educations_set_updated_at before update on public.profile_educations for each row execute function public.set_updated_at();
create trigger profile_experiences_set_updated_at before update on public.profile_experiences for each row execute function public.set_updated_at();
create trigger skills_set_updated_at before update on public.skills for each row execute function public.set_updated_at();
create trigger user_settings_set_updated_at before update on public.user_settings for each row execute function public.set_updated_at();
create or replace function public.create_profile_for_user() returns trigger language plpgsql security definer set search_path = public as $$ begin insert into public.profiles(id, handle, display_name) values(new.id, 'user-' || replace(new.id::text, '-', ''), coalesce(new.raw_user_meta_data->>'display_name','New user')); insert into public.user_settings(user_id) values(new.id); return new; end; $$;
create trigger auth_user_profile_created after insert on auth.users for each row execute function public.create_profile_for_user();
alter table public.profiles enable row level security; alter table public.profile_educations enable row level security; alter table public.profile_experiences enable row level security; alter table public.skills enable row level security; alter table public.profile_skills enable row level security; alter table public.user_settings enable row level security;
create policy profiles_read on public.profiles for select to authenticated using (deleted_at is null and (id = auth.uid() or directory_visibility = 'public' or (directory_visibility = 'campus' and campus_id is not null and campus_id = (select campus_id from public.profiles where id = auth.uid()))));
create policy profiles_update_own on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy profile_educations_owner on public.profile_educations for all to authenticated using (profile_id = auth.uid()) with check (profile_id = auth.uid());
create policy profile_experiences_read on public.profile_experiences for select to authenticated using (profile_id = auth.uid() or visibility = 'public');
create policy profile_experiences_owner on public.profile_experiences for all to authenticated using (profile_id = auth.uid()) with check (profile_id = auth.uid());
create policy skills_read on public.skills for select to authenticated using (true);
create policy profile_skills_read on public.profile_skills for select to authenticated using (profile_id = auth.uid() or exists(select 1 from public.profiles p where p.id = profile_skills.profile_id and p.directory_visibility <> 'private'));
create policy profile_skills_owner on public.profile_skills for all to authenticated using (profile_id = auth.uid()) with check (profile_id = auth.uid());
create policy user_settings_owner on public.user_settings for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

