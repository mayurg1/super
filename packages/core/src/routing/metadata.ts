import type { RoutePath } from './routes.js';

/** Declarative requirements for future authorization-aware route guards. */
export interface RouteMetadata {
  path: RoutePath;
  requiresAuth?: boolean;
  allowAnonymous?: boolean;
  feature?: string;
  permission?: string;
}
