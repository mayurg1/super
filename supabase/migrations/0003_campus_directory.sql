create table public.campuses (
  id uuid primary key default gen_random_uuid(), code citext not null unique,
  name text not null, timezone text not null default 'Asia/Kolkata', is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()), updated_at timestamptz not null default timezone('utc', now()),
  constraint campuses_code_format check (code::text ~ '^[a-z0-9][a-z0-9-]{1,62}$')
);
create table public.departments (
  id uuid primary key default gen_random_uuid(), campus_id uuid not null references public.campuses(id) on delete restrict,
  code citext not null, name text not null, is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()), updated_at timestamptz not null default timezone('utc', now()),
  unique (campus_id, code)
);
create table public.programs (
  id uuid primary key default gen_random_uuid(), department_id uuid not null references public.departments(id) on delete restrict,
  code citext not null, name text not null, level text not null,
  created_at timestamptz not null default timezone('utc', now()), updated_at timestamptz not null default timezone('utc', now()),
  unique (department_id, code), constraint programs_level check (level in ('undergraduate','postgraduate','doctoral','certificate','other'))
);
create index departments_campus_id_idx on public.departments(campus_id);
create index programs_department_id_idx on public.programs(department_id);
create trigger campuses_set_updated_at before update on public.campuses for each row execute function public.set_updated_at();
create trigger departments_set_updated_at before update on public.departments for each row execute function public.set_updated_at();
create trigger programs_set_updated_at before update on public.programs for each row execute function public.set_updated_at();
alter table public.campuses enable row level security;
alter table public.departments enable row level security;
alter table public.programs enable row level security;
create policy campuses_read on public.campuses for select to authenticated using (is_active);
create policy departments_read on public.departments for select to authenticated using (is_active);
create policy programs_read on public.programs for select to authenticated using (true);

