alter table public.profiles add column if not exists residency_type text;

alter table public.profiles add constraint profiles_residency_type_check
  check (residency_type in ('day_scholar','hosteller'));
