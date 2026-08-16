import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { ROUTES } from '@supercampus/core';
import { Spinner } from '@supercampus/shared';
import { ProtectedLayout, PublicRoute, RootRedirect } from './guards';
import { FeedPage } from '../feed/FeedPage';
import { MarketPage } from '../market/MarketPage';
import { DashboardPage } from '../dashboard/DashboardPage';
import { ProductDetailPage } from '../marketplace/ProductDetailPage';
import { ProjectsPage } from '../projects/ProjectsPage';
import { ProjectDetailPage } from '../projects/ProjectDetailPage';
import { MyProjectsPage } from '../projects/MyProjectsPage';
import { ConnectPage } from '../connect/ConnectPage';
import { ProfilePage } from '../profile/ProfilePage';
import { SettingsPage } from '../profile/SettingsPage';
import { HostelPage } from '../hostel/HostelPage';

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

function PageLoader(): React.ReactElement {
  return <Spinner label="Loading page" />;
}

function withSuspense(element: React.ReactNode): React.ReactElement {
  return <Suspense fallback={<PageLoader />}>{element}</Suspense>;
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
      { path: ROUTES.dashboard, element: <DashboardPage /> },
      { path: ROUTES.market, element: <MarketPage /> },
      { path: ROUTES.marketShopDetail, element: <ProductDetailPage /> },
      { path: ROUTES.projects, element: <ProjectsPage /> },
      { path: ROUTES.projectDetail, element: <ProjectDetailPage /> },
      { path: ROUTES.projectsMine, element: <MyProjectsPage /> },
      { path: `${ROUTES.connect}/:tab?`, element: <ConnectPage /> },
      { path: ROUTES.hostel, element: <HostelPage /> },
      { path: ROUTES.profile, element: <ProfilePage /> },
      { path: ROUTES.profileSettings, element: <SettingsPage /> },
      { path: ROUTES.admin, element: withSuspense(<AdminRequestsPage />) },
      { path: ROUTES.adminRequests, element: withSuspense(<AdminRequestsPage />) },
      { path: `${ROUTES.adminRequests}/:requestId`, element: withSuspense(<AdminRequestDetailPage />) },
    ],
  },
  { path: '*', element: withSuspense(<NotFoundPage />) },
]);
