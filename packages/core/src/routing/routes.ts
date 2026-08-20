/** Canonical route paths — features register under these in Phase 4+. */
export const ROUTES = {
  home: '/home',
  dashboard: '/dashboard',
  login: '/login',
  signup: '/signup',
  resetPassword: '/reset-password',
  onboarding: '/onboarding',
  pendingApproval: '/pending-approval',
  privacy: '/privacy',
  market: '/market',
  marketShopDetail: '/market/shop/:productId',
  projects: '/projects',
  projectsMine: '/projects/mine',
  projectDetail: '/projects/:projectId',
  connect: '/connect',
  connectAlumni: '/connect/alumni',
  connectStudents: '/connect/students',
  connectFaculty: '/connect/faculty',
  connectJobs: '/connect/jobs',
  connectEvents: '/connect/events',
  connectJobDetail: '/connect/jobs/:jobId',
  connectEventDetail: '/connect/events/:eventId',
  connectProfile: '/connect/profile/:userId',
  chat: '/chat',
  chatConversation: '/chat/:conversationId',
  hostel: '/hostel',
  profile: '/profile',
  profileSettings: '/profile/settings',
  admin: '/admin',
  adminRequests: '/admin/requests',
} as const;

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];

export const PUBLIC_ROUTES: readonly string[] = [ROUTES.login, ROUTES.onboarding, ROUTES.privacy];

export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}
