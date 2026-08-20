-- ---------------------------------------------------------------------------
-- 0038 Publish chat in navigation
-- ---------------------------------------------------------------------------
-- WHY:
--   The `chat` feature row was registered (seed + 0027) but with a NULL route
--   and it was only granted to super_admin / student / alumni. buildNavigation
--   only renders features that have a route, so /chat was never reachable from
--   the sidebar. This migration publishes the route and grants the feature to
--   the roles that should use messaging (students, alumni, faculty, admins).
-- ---------------------------------------------------------------------------

insert into public.feature_registry(key,name,description,module_group,icon,route,sort_order,is_enabled)
values ('chat','Messages','Campus messaging','social','💬','/chat',80,true)
on conflict(key) do update set
  name = excluded.name,
  description = excluded.description,
  module_group = excluded.module_group,
  icon = excluded.icon,
  route = excluded.route,
  sort_order = excluded.sort_order,
  is_enabled = excluded.is_enabled;

-- Grant messaging to the roles that may use it (idempotent; student/alumni
-- already hold it, this re-asserts and adds faculty + campus admin).
insert into public.role_features(role_id, feature_id)
select r.id, f.id
from public.roles r
join public.feature_registry f on f.key = 'chat'
where r.key in ('campus_admin', 'faculty', 'student', 'alumni')
on conflict do nothing;