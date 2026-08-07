import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { ROUTES } from '@supercampus/core';
import { Spinner } from '@supercampus/shared';
import type { RouteMetadata } from '@supercampus/core';
import { useAuthorization } from '@supercampus/supabase';
import { AppLayout } from '../layout/AppLayout';
import { useUserApplicationState } from '../providers/useUserApplicationState';

function routeForStatus(status: string): string | null {
  if (status === 'anonymous') return ROUTES.login;
  if (status === 'onboarding') return ROUTES.onboarding;
  if (status === 'pending') return ROUTES.pendingApproval;
  if (status === 'ready') return ROUTES.home;
  return null;
}

export function ProtectedLayout(): React.ReactElement {
  const location = useLocation();
  const { status, isAuthenticated } = useUserApplicationState();
  if (status === 'loading') return <Spinner label="Restoring session" />;
  if (!isAuthenticated) return <Navigate to={ROUTES.login} state={{ from: location }} replace />;
  if (status === 'onboarding') return <Navigate to={ROUTES.onboarding} replace />;
  if (status === 'pending') return <Navigate to={ROUTES.pendingApproval} replace />;
  // status === 'ready' → user is authorized for the protected app; render it on any protected route.
  return <AppLayout><Outlet /></AppLayout>;
}

export function PublicRoute({ children }: { children: React.ReactNode }): React.ReactElement {
  const { status } = useUserApplicationState();
  if (status === 'loading') return <Spinner label="Restoring session" />;
  if (status === 'anonymous') return <>{children}</>;
  return <Navigate to={routeForStatus(status) ?? ROUTES.home} replace />;
}

export function FeatureRoute({ metadata, children }: { metadata: RouteMetadata; children: React.ReactNode }): React.ReactElement {
  const { hasFeature, hasPermission } = useAuthorization();
  if (metadata.feature && !hasFeature(metadata.feature)) return <Navigate to={ROUTES.home} replace />;
  if (metadata.permission && !hasPermission(metadata.permission)) return <Navigate to={ROUTES.home} replace />;
  return <>{children}</>;
}

export const PermissionRoute = FeatureRoute;

export function RootRedirect(): React.ReactElement {
  const { status } = useUserApplicationState();
  if (status === 'loading') return <Spinner label="Preparing SUPERCAMPUS" />;
  return <Navigate to={routeForStatus(status) ?? ROUTES.home} replace />;
}