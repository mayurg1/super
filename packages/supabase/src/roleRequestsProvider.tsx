import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactElement, type ReactNode } from 'react';
import {
  createRoleRequestService,
  type RoleRequest,
  type RoleRequestInput,
  type RoleRequestWithRole,
} from './roleRequests.js';
import { useAuth } from './authProvider.js';
import { useProfile } from './profileProvider.js';
import { useAuthorization } from './authorizationProvider.js';
import { useSupabase } from './provider.js';

export interface RoleRequestsContextValue {
  myRequests: RoleRequest[];
  current: RoleRequest | null;
  pendingRequests: RoleRequestWithRole[];
  loading: boolean;
  error: string | null;
  canManage: boolean;
  createRequest: (input: RoleRequestInput) => Promise<boolean>;
  approve: (requestId: string, assignment?: { roleId?: string; campusId?: string }) => Promise<boolean>;
  reject: (requestId: string, note?: string) => Promise<boolean>;
  refresh: () => Promise<void>;
  refreshPending: () => Promise<void>;
}

const Context = createContext<RoleRequestsContextValue | null>(null);

export function RoleRequestsProvider({ children }: { children: ReactNode }): ReactElement {
  const { user, authenticated } = useAuth();
  const { profile } = useProfile();
  const client = useSupabase();
  const { hasPermission } = useAuthorization();
  const service = useMemo(() => createRoleRequestService(client), [client]);
  const canManage = hasPermission('rbac.manage');

  const [myRequests, setMyRequests] = useState<RoleRequest[]>([]);
  const [pendingRequests, setPendingRequests] = useState<RoleRequestWithRole[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (): Promise<void> => {
    if (!user) { setMyRequests([]); return; }
    setLoading(true);
    const result = await service.listMine(user.id);
    if (result.data) setMyRequests(result.data); else setError(result.error);
    setLoading(false);
  }, [service, user]);

  const refreshPending = useCallback(async (): Promise<void> => {
    if (!canManage) { setPendingRequests([]); return; }
    const result = await service.listPending();
    if (result.data) setPendingRequests(result.data); else setError(result.error);
  }, [service, canManage]);

  useEffect(() => {
    if (!authenticated || !user) { setMyRequests([]); return; }
    void refresh();
  }, [authenticated, user, refresh]);

  useEffect(() => {
    void refreshPending();
  }, [refreshPending]);

  const createRequest = useCallback(
    async (input: RoleRequestInput): Promise<boolean> => {
      if (!user) return false;
      const result = await service.create(user.id, { ...input, campusId: profile?.campus_id ?? input.campusId });
      if (result.data) { await refresh(); return true; }
      setError(result.error);
      return false;
    },
    [service, user, profile, refresh],
  );

  const approve = useCallback(
    async (requestId: string, assignment?: { roleId?: string; campusId?: string }): Promise<boolean> => {
      if (!user) return false;
      const result = await service.approve(requestId, user.id, assignment ?? {});
      if (result.data) { await refreshPending(); return true; }
      setError(result.error);
      return false;
    },
    [service, user, refreshPending],
  );

  const reject = useCallback(
    async (requestId: string, note?: string): Promise<boolean> => {
      if (!user) return false;
      const result = await service.reject(requestId, user.id, note);
      if (result.data) { await refreshPending(); return true; }
      setError(result.error);
      return false;
    },
    [service, user, refreshPending],
  );

  const current = useMemo(
    () => myRequests.find((r) => r.status === 'pending') ?? myRequests[0] ?? null,
    [myRequests],
  );

  const value = useMemo<RoleRequestsContextValue>(
    () => ({
      myRequests,
      current,
      pendingRequests,
      loading,
      error,
      canManage,
      createRequest,
      approve,
      reject,
      refresh,
      refreshPending,
    }),
    [myRequests, current, pendingRequests, loading, error, canManage, createRequest, approve, reject, refresh, refreshPending],
  );

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useRoleRequests(): RoleRequestsContextValue {
  const value = useContext(Context);
  if (!value) throw new Error('useRoleRequests must be used inside RoleRequestsProvider');
  return value;
}
