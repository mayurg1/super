-- Fixes profile creation for new auth users without weakening the handle constraint.
create or replace function public.create_profile_for_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  base_handle text;
  handle_suffix text;
  generated_handle text;
begin
  base_handle := lower(coalesce(nullif(split_part(coalesce(new.email, ''), '@', 1), ''), 'user'));
  base_handle := regexp_replace(base_handle, '[^a-z0-9_.-]+', '', 'g');
  base_handle := regexp_replace(base_handle, '^[^a-z0-9]+', '', 'g');

  if length(base_handle) < 3 then
    base_handle := 'user';
  end if;

  handle_suffix := left(replace(new.id::text, '-', ''), 6);
  generated_handle := left(base_handle, 25) || '_' || handle_suffix;

  insert into public.profiles (id, handle, display_name)
  values (
    new.id,
    generated_handle,
    coalesce(nullif(new.raw_user_meta_data ->> 'display_name', ''), base_handle)
  )
  on conflict (id) do nothing;

  insert into public.user_settings (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;
