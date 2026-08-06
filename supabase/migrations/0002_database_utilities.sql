create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = timezone('utc', now()); return new; end;
$$;

create or replace function public.current_profile_id()
returns uuid language sql stable security invoker set search_path = public as $$
  select auth.uid()
$$;

create or replace function public.is_valid_object_path(value text)
returns boolean language sql immutable as $$
  select value ~ '^[a-z0-9][a-z0-9/_-]{0,1023}$'
$$;

