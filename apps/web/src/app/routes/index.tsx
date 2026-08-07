import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { ROUTES } from '@supercampus/core';
import { Spinner } from '@supercampus/shared';
import { ProtectedLayout, PublicRoute, RootRedirect } from './guards';
import { FeedPage } from '../feed/FeedPage';
import { MarketplacePage } from '../marketplace/MarketplacePage';
import { FoodPage } from '../food/FoodPage';

const LoginPage = lazy(() => import('../pages/LoginPage').then((module) => ({ default: module.LoginPage })));
const SignUpPage = lazy(() => import('../pages/LoginPage').then((module) => ({ default: module.SignUpPage })));
const ResetPasswordPage = lazy(() =>
  import('../pages/LoginPage').then((module) => ({ default: module.ResetPasswordPage })),
);
const OnboardingPage = lazy(() => import('../pages/OnboardingPage').then((module) => ({ default: module.OnboardingPage })));
const PendingApprovalPage = lazy(() =>
  import('../pages/PendingApprovalPage').then((module) => ({ default: module.PendingApprovalPage })),
);
const AdminRequestsPage = lazy(() =>
  import('../pages/AdminRequestsPage').then((module) => ({ default: module.AdminRequestsPage })),
);
const AdminRequestDetailPage = lazy(() =>
  import('../pages/AdminRequestDetailPage').then((module) => ({ default: module.AdminRequestDetailPage })),
);
const NotFoundPage = lazy(() => import('../pages/NotFoundPage').then((module) => ({ default: module.NotFoundPage })));
const PlaceholderPage = lazy(() =>
  import('../pages/PlaceholderPage').then((module) => ({ default: module.PlaceholderPage })),
);

function PageLoader(): React.ReactElement {
  return <Spinner label="Loading page" />;
}

function withSuspense(element: React.ReactNode): React.ReactElement {
  return <Suspense fallback={<PageLoader />}>{element}</Suspense>;
}

function placeholder(title: string, description: string, icon?: string): React.ReactElement {
  return withSuspense(<PlaceholderPage title={title} description={description} icon={icon} />);
}

export const appRouter = createBrowserRouter([
  { path: '/', element: <RootRedirect /> },
  { path: ROUTES.login, element: <PublicRoute>{withSuspense(<LoginPage />)}</PublicRoute> },
  { path: ROUTES.signup, element: <PublicRoute>{withSuspense(<SignUpPage />)}</PublicRoute> },
  { path: ROUTES.resetPassword, element: <PublicRoute>{withSuspense(<ResetPasswordPage />)}</PublicRoute> },
  { path: ROUTES.onboarding, element: withSuspense(<OnboardingPage />) },
  { path: ROUTES.pendingApproval, element: withSuspense(<PendingApprovalPage />) },
  {
    element: <ProtectedLayout />,
    children: [
      { path: ROUTES.home, element: <FeedPage /> },
      { path: ROUTES.marketFood, element: <FoodPage /> },
      { path: ROUTES.marketShop, element: <MarketplacePage /> },
      { path: ROUTES.projects, element: placeholder('Projects', 'Projects feature ships in Phase 4.', '🚀') },
      { path: ROUTES.projectsMine, element: placeholder('My Projects', 'Projects inbox ships in Phase 4.', '📁') },
      { path: ROUTES.projectsCrowdfund, element: placeholder('Crowdfunding', 'Crowdfunding ships in Phase 4.', '💰') },
      { path: ROUTES.connectAlumni, element: placeholder('Alumni Directory', 'Connect feature ships in Phase 4.', '🎓') },
      { path: ROUTES.connectStudents, element: placeholder('Students', 'Connect feature ships in Phase 4.', '👥') },
      { path: ROUTES.connectFaculty, element: placeholder('Faculty', 'Connect feature ships in Phase 4.', '👨🏫') },
      { path: ROUTES.connectJobs, element: placeholder('Jobs', 'Jobs feature ships in Phase 4.', '💼') },
      { path: ROUTES.connectEvents, element: placeholder('Events', 'Events feature ships in Phase 4.', '🎉') },
      { path: ROUTES.hostel, element: placeholder('Hostel', 'Hostel feature ships in Phase 4.', '🏛️') },
      { path: ROUTES.profile, element: placeholder('Profile', 'Profile feature ships in Phase 4.', '👤') },
      { path: ROUTES.profileSettings, element: placeholder('Settings', 'Settings ships in Phase 4.', '⚙️') },
      { path: ROUTES.admin, element: withSuspense(<AdminRequestsPage />) },
      { path: ROUTES.adminRequests, element: withSuspense(<AdminRequestsPage />) },
      { path: `${ROUTES.adminRequests}/:requestId`, element: withSuspense(<AdminRequestDetailPage />) },
    ],
  },
  { path: '*', element: withSuspense(<NotFoundPage />) },
]);
