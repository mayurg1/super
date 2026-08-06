import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { ROUTES } from '@supercampus/core';
import { Spinner } from '@supercampus/shared';
import { useAuth } from '@supercampus/supabase';
import { useAuthorization } from '@supercampus/supabase';
import type { RouteMetadata } from '@supercampus/core';
import { AppLayout } from '../layout/AppLayout';

/** Auth guard — foundation allows all routes in dev; redirects when unauthenticated in prod paths. */
export function ProtectedLayout(): React.ReactElement {
  const location = useLocation();
  const { authenticated, loading } = useAuth();
  if (loading) return <Spinner label="Restoring session" />;

  if (!authenticated) return <Navigate to={ROUTES.login} state={{ from: location }} replace />;

  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}

export function PublicRoute({ children }: { children: React.ReactNode }): React.ReactElement {
  const { authenticated, loading } = useAuth();
  if (loading) return <Spinner label="Restoring session" />;
  return authenticated ? <Navigate to={ROUTES.home} replace /> : <>{children}</>;
}

export function FeatureRoute({ metadata, children }: { metadata: RouteMetadata; children: React.ReactNode }): React.ReactElement {
  const { authenticated } = useAuth(); const { hasFeature, hasPermission } = useAuthorization();
  if (metadata.requiresAuth && !authenticated) return <Navigate to={ROUTES.login} replace />;
  if (metadata.feature && !hasFeature(metadata.feature)) return <Navigate to={ROUTES.home} replace />;
  if (metadata.permission && !hasPermission(metadata.permission)) return <Navigate to={ROUTES.home} replace />;
  return <>{children}</>;
}

export const PermissionRoute = FeatureRoute;

export function RootRedirect(): React.ReactElement {
  return <Navigate to={ROUTES.home} replace />;
}
