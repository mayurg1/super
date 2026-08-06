/** Platform-level events only. Feature events added in Phase 4+. */
export interface PlatformEventMap {
  'auth:signed_in': { userId: string };
  'auth:signed_out': undefined;
  'auth:session_expired': undefined;
  'theme:changed': { theme: 'light' | 'dark' };
  'app:error': { code: string; message: string };
}

export type PlatformEventName = keyof PlatformEventMap;

export type EventHandler<T> = (payload: T) => void;
