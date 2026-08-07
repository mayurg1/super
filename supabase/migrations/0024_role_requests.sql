-- Role requests: users request a campus role during onboarding; admins approve/reject.
create table public.role_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  campus_id uuid references public.campuses(id) on delete restrict,
  requested_role_id uuid references public.roles(id) on delete set null,
  status text not null default 'pending',
  reason text,
  student_id uuid,
  employee_id uuid,
  supporting_document_asset_id uuid,
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  rejection_reason text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint role_requests_status check (status in ('pending','approved','rejected'))
);
create index role_requests_user_idx on public.role_requests(user_id, created_at desc);
create index role_requests_status_idx on public.role_requests(status, created_at asc);
create trigger role_requests_set_updated_at before update on public.role_requests for each row execute function public.set_updated_at();
alter table public.role_requests enable row level security;
create policy role_requests_self_read on public.role_requests for select to authenticated using (user_id = auth.uid() or public.has_permission('rbac.manage', campus_id));
create policy role_requests_self_insert on public.role_requests for insert to authenticated with check (user_id = auth.uid() and status = 'pending');
create policy role_requests_admin_update on public.role_requests for update to authenticated using (public.has_permission('rbac.manage', campus_id)) with check (public.has_permission('rbac.manage', campus_id));
