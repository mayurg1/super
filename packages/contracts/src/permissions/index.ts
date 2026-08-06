export type UserType = 'hosteller' | 'day_scholar' | 'faculty' | 'alumni' | 'admin';

export type UserRole = 'student' | 'faculty' | 'alumni' | 'admin';

export type Capability =
  | 'feed:read'
  | 'feed:create'
  | 'marketplace:read'
  | 'marketplace:create'
  | 'jobs:read'
  | 'jobs:create'
  | 'jobs:apply'
  | 'events:read'
  | 'events:create'
  | 'events:register'
  | 'connect:read'
  | 'connect:message'
  | 'hostel:outpass'
  | 'hostel:complaint'
  | 'admin:access'
  | 'admin:outpass_approve';

/** Default capability map — server ACL is authoritative in production. */
export const DEFAULT_CAPABILITIES: Record<UserType, readonly Capability[]> = {
  hosteller: [
    'feed:read',
    'feed:create',
    'marketplace:read',
    'marketplace:create',
    'jobs:read',
    'jobs:apply',
    'events:read',
    'events:create',
    'events:register',
    'connect:read',
    'connect:message',
    'hostel:outpass',
    'hostel:complaint',
  ],
  day_scholar: [
    'feed:read',
    'feed:create',
    'marketplace:read',
    'marketplace:create',
    'jobs:read',
    'jobs:apply',
    'events:read',
    'events:create',
    'events:register',
    'connect:read',
    'connect:message',
    'hostel:complaint',
  ],
  faculty: [
    'feed:read',
    'feed:create',
    'marketplace:read',
    'marketplace:create',
    'jobs:read',
    'jobs:create',
    'events:read',
    'events:create',
    'events:register',
    'connect:read',
    'connect:message',
  ],
  alumni: [
    'feed:read',
    'feed:create',
    'marketplace:read',
    'marketplace:create',
    'jobs:read',
    'jobs:create',
    'events:read',
    'events:create',
    'events:register',
    'connect:read',
    'connect:message',
  ],
  admin: [
    'feed:read',
    'feed:create',
    'marketplace:read',
    'marketplace:create',
    'jobs:read',
    'jobs:create',
    'jobs:apply',
    'events:read',
    'events:create',
    'events:register',
    'connect:read',
    'connect:message',
    'admin:access',
    'admin:outpass_approve',
  ],
};
