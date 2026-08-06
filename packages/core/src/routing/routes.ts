/** Canonical route paths — features register under these in Phase 4+. */
export const ROUTES = {
  home: '/home',
  login: '/login',
  signup: '/signup',
  resetPassword: '/reset-password',
  onboarding: '/onboarding',
  marketFood: '/market/food',
  marketShop: '/market/shop',
  projects: '/projects',
  projectsMine: '/projects/mine',
  projectsCrowdfund: '/projects/crowdfund',
  connectAlumni: '/connect/alumni',
  connectStudents: '/connect/students',
  connectFaculty: '/connect/faculty',
  connectJobs: '/connect/jobs',
  connectEvents: '/connect/events',
  hostel: '/hostel',
  profile: '/profile',
  profileSettings: '/profile/settings',
  admin: '/admin',
} as const;

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  path: RoutePath;
  requiredCapability?: string;
}

export const BOTTOM_NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home', icon: '🏠', path: ROUTES.home, requiredCapability: 'feed:read' },
  {
    id: 'market',
    label: 'Market',
    icon: '🛒',
    path: ROUTES.marketFood,
    requiredCapability: 'marketplace:read',
  },
  {
    id: 'projects',
    label: 'Projects',
    icon: '🚀',
    path: ROUTES.projects,
    requiredCapability: 'feed:read',
  },
  {
    id: 'hostel',
    label: 'Hostel',
    icon: '🏛️',
    path: ROUTES.hostel,
    requiredCapability: 'hostel:outpass',
  },
  {
    id: 'connect',
    label: 'Connect',
    icon: '👥',
    path: ROUTES.connectAlumni,
    requiredCapability: 'connect:read',
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: '👤',
    path: ROUTES.profile,
  },
];

export const PUBLIC_ROUTES: readonly string[] = [ROUTES.login, ROUTES.onboarding];

export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}
