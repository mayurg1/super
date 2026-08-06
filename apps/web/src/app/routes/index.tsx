import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { ROUTES } from '@supercampus/core';
import { Spinner } from '@supercampus/shared';
import { ProtectedLayout, PublicRoute, RootRedirect } from './guards';
import { FeedPage } from '../feed/FeedPage';

const LoginPage = lazy(() => import('../pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const OnboardingPage = lazy(() =>
  import('../pages/LoginPage').then((m) => ({ default: m.OnboardingPage })),
);
const SignUpPage = lazy(() => import('../pages/LoginPage').then((m) => ({ default: m.SignUpPage })));
const ResetPasswordPage = lazy(() => import('../pages/LoginPage').then((m) => ({ default: m.ResetPasswordPage })));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));
const PlaceholderPage = lazy(() =>
  import('../pages/PlaceholderPage').then((m) => ({ default: m.PlaceholderPage })),
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
  {
    path: '/',
    element: <RootRedirect />,
  },
  {
    path: ROUTES.login,
    element: <PublicRoute>{withSuspense(<LoginPage />)}</PublicRoute>,
  },
  {
    path: ROUTES.signup,
    element: <PublicRoute>{withSuspense(<SignUpPage />)}</PublicRoute>,
  },
  {
    path: ROUTES.resetPassword,
    element: <PublicRoute>{withSuspense(<ResetPasswordPage />)}</PublicRoute>,
  },
  {
    path: ROUTES.onboarding,
    element: withSuspense(<OnboardingPage />),
  },
  {
    element: <ProtectedLayout />,
    children: [
      {
        path: ROUTES.home,
        element: <FeedPage />,
      },
      {
        path: ROUTES.marketFood,
        element: placeholder('Food Delivery', 'Food feature ships in a later phase.', '🛵'),
      },
      {
        path: ROUTES.marketShop,
        element: placeholder('Marketplace', 'Marketplace feature ships in Phase 4.', '🏪'),
      },
      {
        path: ROUTES.projects,
        element: placeholder('Projects', 'Projects feature ships in Phase 4.', '🚀'),
      },
      {
        path: ROUTES.projectsMine,
        element: placeholder('My Projects', 'Projects inbox ships in Phase 4.', '📁'),
      },
      {
        path: ROUTES.projectsCrowdfund,
        element: placeholder('Crowdfunding', 'Crowdfunding ships in Phase 4.', '💰'),
      },
      {
        path: ROUTES.connectAlumni,
        element: placeholder('Alumni Directory', 'Connect feature ships in Phase 4.', '🎓'),
      },
      {
        path: ROUTES.connectStudents,
        element: placeholder('Students', 'Connect feature ships in Phase 4.', '👥'),
      },
      {
        path: ROUTES.connectFaculty,
        element: placeholder('Faculty', 'Connect feature ships in Phase 4.', '👨‍🏫'),
      },
      {
        path: ROUTES.connectJobs,
        element: placeholder('Jobs', 'Jobs feature ships in Phase 4.', '💼'),
      },
      {
        path: ROUTES.connectEvents,
        element: placeholder('Events', 'Events feature ships in Phase 4.', '🎉'),
      },
      {
        path: ROUTES.hostel,
        element: placeholder('Hostel', 'Hostel feature ships in Phase 4.', '🏛️'),
      },
      {
        path: ROUTES.profile,
        element: placeholder('Profile', 'Profile feature ships in Phase 4.', '👤'),
      },
      {
        path: ROUTES.profileSettings,
        element: placeholder('Settings', 'Settings ships in Phase 4.', '⚙️'),
      },
      {
        path: ROUTES.admin,
        element: placeholder('Admin', 'Admin dashboard ships in Phase 4.', '🛡️'),
      },
    ],
  },
  {
    path: '*',
    element: withSuspense(<NotFoundPage />),
  },
]);
