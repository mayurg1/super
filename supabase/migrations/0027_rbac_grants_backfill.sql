-- 0027 RBAC grant backfill (idempotent).
-- WHY: the client loads a user's ROLES but FEATURES/PERMISSIONS are empty when
-- the seeded RBAC rows (roles/feature_registry/permissions/role_features/
-- role_permissions) were not applied to the DB. As a result FeatureRoute/
-- PermissionRoute redirect even the super_admin to /home for gated routes.
-- Backfills the exact seed grants so they are guaranteed to exist.

-- 1) Roles
insert into public.roles(key,name,description,is_system) values
('super_admin','Super Admin','Platform-wide administration',true),
('campus_admin','Campus Admin','Campus administration',true),
('faculty','Faculty','Faculty member',true),
('student','Student','Student member',true),
('alumni','Alumni','Alumni member',true),
('vendor','Vendor','Campus vendor',true),
('hostel_staff','Hostel Staff','Hostel operations staff',true),
('moderator','Moderator','Content moderation staff',true)
on conflict(key) do update set name=excluded.name,description=excluded.description;

-- 2) Features
insert into public.feature_registry(key,name,description,module_group,icon,route,sort_order,is_enabled) values
('feed','Feed','Campus social feed','social','📰','/home',10,true),
('marketplace','Marketplace','Campus marketplace','commerce','🛍','/market/shop',20,true),
('projects','Projects','Campus projects','collaboration','🚀','/projects',30,true),
('crowdfunding','Crowdfunding','Project campaigns','finance','💰','/projects/crowdfund',31,true),
('jobs','Jobs','Career opportunities','career','💼','/connect/jobs',40,true),
('events','Events','Campus events','campus','🎉','/connect/events',50,true),
('hostel','Hostel','Hostel services','campus','🏛','/hostel',60,true),
('food_delivery','Food Delivery','Campus food','commerce','🍽','/market/food',70,true),
('chat','Chat','Campus messaging','social','💬',null,80,true),
('notifications','Notifications','Notifications','platform','🔔',null,90,true),
('profile','Profile','Your profile','account','👤','/profile',100,true),
('dashboard','Dashboard','Your dashboard','platform','⌂','/home',5,true),
('admin','Admin','Administration','platform','🛡','/admin',110,true),
('analytics','Analytics','Platform analytics','platform','📊',null,120,true),
('settings','Settings','Account settings','account','⚙','/profile/settings',130,true),
('directory','Directory','Campus directory','social','👥','/connect/alumni',35,true)
on conflict(key) do update set name=excluded.name,description=excluded.description,module_group=excluded.module_group,icon=excluded.icon,route=excluded.route,sort_order=excluded.sort_order,is_enabled=excluded.is_enabled;

-- 3) Permissions
insert into public.permissions(key,module,description) values
('users.read','users','Read users'),('users.write','users','Manage users'),
('rbac.manage','platform','Manage roles and assignments'),
('features.manage','platform','Manage features'),
('settings.manage','settings','Manage settings'),
('posts.create','feed','Create posts'),('posts.edit','feed','Edit own posts'),
('posts.delete','feed','Delete posts'),('posts.moderate','feed','Moderate posts'),
('stories.create','feed','Create stories'),('stories.moderate','feed','Moderate stories'),
('marketplace.create','marketplace','Create listings'),
('marketplace.purchase','marketplace','Purchase listings'),
('marketplace.moderate','marketplace','Moderate marketplace'),
('marketplace.categories.manage','marketplace','Manage categories'),
('projects.manage','projects','Manage projects'),
('crowdfunding.manage','crowdfunding','Manage campaigns'),
('events.manage','events','Manage events'),
('jobs.post','jobs','Post jobs'),('jobs.apply','jobs','Apply for jobs'),
('jobs.manage','jobs','Manage jobs'),
('hostel.manage','hostel','Manage hostel'),('hostel.allocate','hostel','Allocate rooms'),
('hostel.outpasses.manage','hostel','Manage outpasses'),
('hostel.complaints.manage','hostel','Manage complaints'),
('hostel.attendance.manage','hostel','Manage attendance'),
('food.manage','food','Manage food'),
('notifications.manage','notifications','Manage notifications'),
('analytics.read','analytics','View analytics'),
('audit.read','platform','Read audit trail'),
('moderation.manage','moderation','Moderate content'),
('media.manage','media','Manage media'),
('payments.read','payments','Read payments')
on conflict(key) do update set module=excluded.module,description=excluded.description;

-- 4) Role -> feature grants
insert into public.role_features(role_id,feature_id)
select r.id,f.id from public.roles r cross join public.feature_registry f where r.key='super_admin' on conflict do nothing;
insert into public.role_features(role_id,feature_id)
select r.id,f.id from public.roles r join public.feature_registry f
  on f.key=any(case r.key
    when 'campus_admin' then array['feed','projects','jobs','events','hostel','food_delivery','notifications','profile','dashboard','admin','analytics','settings','directory']
    when 'faculty' then array['feed','projects','jobs','events','profile','dashboard','settings','directory']
    when 'student' then array['feed','marketplace','projects','jobs','events','hostel','food_delivery','chat','notifications','profile','dashboard','settings','directory']
    when 'alumni' then array['feed','marketplace','projects','jobs','events','chat','notifications','profile','dashboard','settings','directory']
    when 'vendor' then array['marketplace','food_delivery','profile','dashboard','settings']
    when 'hostel_staff' then array['hostel','notifications','profile','dashboard','settings']
    when 'moderator' then array['feed','marketplace','profile','dashboard','settings']
    else array[]::text[] end)
where r.key<>'super_admin' on conflict do nothing;

-- 5) Role -> permission grants
insert into public.role_permissions(role_id,permission_id)
select r.id,p.id from public.roles r cross join public.permissions p where r.key='super_admin' on conflict do nothing;
insert into public.role_permissions(role_id,permission_id)
select r.id,p.id from public.roles r join public.permissions p
  on p.key=any(case r.key
    when 'student' then array['posts.create','posts.edit','marketplace.create','marketplace.purchase','jobs.apply']
    when 'faculty' then array['posts.create','posts.edit','projects.manage','events.manage','jobs.post']
    when 'alumni' then array['posts.create','marketplace.create','marketplace.purchase','jobs.post','jobs.apply']
    when 'vendor' then array['marketplace.create','food.manage']
    when 'hostel_staff' then array['hostel.manage','hostel.allocate','hostel.outpasses.manage','hostel.complaints.manage','hostel.attendance.manage']
    when 'moderator' then array['posts.moderate','stories.moderate','marketplace.moderate','moderation.manage']
    when 'campus_admin' then array['users.read','users.write','events.manage','jobs.manage','hostel.manage','food.manage','notifications.manage','analytics.read']
    else array[]::text[] end)
where r.key<>'super_admin' on conflict do nothing;

