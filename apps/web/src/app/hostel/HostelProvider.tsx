import { useCallback, useEffect, useMemo, useState, type ReactElement, type ReactNode } from 'react';
import {
  createHostelService,
  useAuth,
  useAuthorization,
  useSupabase,
  type ComplaintInput,
  type HostelComplaint,
  type OutpassInput,
  type OutpassRequest,
  type ReviewComplaintStatus,
  type ReviewOutpassStatus,
} from '@supercampus/supabase';
import { HostelContext, type HostelContextValue } from './HostelContext';

export function HostelProvider({ children }: { children: ReactNode }): ReactElement {
  const { user } = useAuth();
  const client = useSupabase();
  const { hasPermission } = useAuthorization();
  const service = useMemo(() => createHostelService(client), [client]);

  const canManageOutpasses = hasPermission('hostel.outpasses.manage');
  const canManageComplaints = hasPermission('hostel.complaints.manage');

  const [myOutpasses, setMyOutpasses] = useState<OutpassRequest[]>([]);
  const [myComplaints, setMyComplaints] = useState<HostelComplaint[]>([]);
  const [pendingOutpasses, setPendingOutpasses] = useState<OutpassRequest[]>([]);
  const [openComplaints, setOpenComplaints] = useState<HostelComplaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (): Promise<void> => {
    if (!user) {
      setMyOutpasses([]);
      setMyComplaints([]);
      setPendingOutpasses([]);
      setOpenComplaints([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    const outpassResult = await service.getMyOutpassRequests(user.id);
    if (outpassResult.data) setMyOutpasses(outpassResult.data);
    else setError(outpassResult.error);

    const complaintResult = await service.getMyComplaints(user.id);
    if (complaintResult.data) setMyComplaints(complaintResult.data);
    else setError(complaintResult.error);

    if (canManageOutpasses) {
      const queue = await service.getPendingOutpassRequests();
      if (queue.data) setPendingOutpasses(queue.data);
      else setError(queue.error);
    } else {
      setPendingOutpasses([]);
    }

    if (canManageComplaints) {
      const queue = await service.getOpenComplaints();
      if (queue.data) setOpenComplaints(queue.data);
      else setError(queue.error);
    } else {
      setOpenComplaints([]);
    }

    setLoading(false);
  }, [canManageComplaints, canManageOutpasses, service, user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const createOutpass = useCallback(
    async (input: OutpassInput): Promise<boolean> => {
      if (!user) return false;
      setError(null);
      const result = await service.createOutpassRequest(user.id, input);
      if (!result.data) {
        setError(result.error);
        return false;
      }
      await refresh();
      return true;
    },
    [refresh, service, user],
  );

  const createComplaint = useCallback(
    async (input: ComplaintInput): Promise<boolean> => {
      if (!user) return false;
      setError(null);
      const result = await service.createComplaint(user.id, input);
      if (!result.data) {
        setError(result.error);
        return false;
      }
      await refresh();
      return true;
    },
    [refresh, service, user],
  );

  const reviewOutpass = useCallback(
    async (requestId: string, status: ReviewOutpassStatus): Promise<boolean> => {
      if (!user) return false;
      setError(null);
      const result = await service.reviewOutpassRequest(requestId, user.id, status);
      if (!result.data) {
        setError(result.error);
        return false;
      }
      await refresh();
      return true;
    },
    [refresh, service, user],
  );

  const reviewComplaint = useCallback(
    async (complaintId: string, status: ReviewComplaintStatus): Promise<boolean> => {
      if (!user) return false;
      setError(null);
      const result = await service.reviewComplaint(complaintId, user.id, status);
      if (!result.data) {
        setError(result.error);
        return false;
      }
      await refresh();
      return true;
    },
    [refresh, service, user],
  );

  const value = useMemo<HostelContextValue>(
    () => ({
      myOutpasses,
      myComplaints,
      pendingOutpasses,
      openComplaints,
      loading,
      error,
      canManageOutpasses,
      canManageComplaints,
      createOutpass,
      createComplaint,
      reviewOutpass,
      reviewComplaint,
      refresh,
    }),
    [
      canManageComplaints,
      canManageOutpasses,
      createComplaint,
      createOutpass,
      error,
      loading,
      myComplaints,
      myOutpasses,
      openComplaints,
      pendingOutpasses,
      refresh,
      reviewComplaint,
      reviewOutpass,
    ],
  );

  return <HostelContext.Provider value={value}>{children}</HostelContext.Provider>;
}