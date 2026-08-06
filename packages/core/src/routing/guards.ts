import { isAuthenticated } from '../auth/sessionStore.js';
import { isPublicRoute, ROUTES } from './routes.js';

export interface RouteGuardResult {
  allowed: boolean;
  redirectTo?: string;
}

export function evaluateAuthGuard(pathname: string): RouteGuardResult {
  if (isPublicRoute(pathname)) {
    return { allowed: true };
  }

  if (!isAuthenticated()) {
    return { allowed: false, redirectTo: ROUTES.login };
  }

  return { allowed: true };
}
