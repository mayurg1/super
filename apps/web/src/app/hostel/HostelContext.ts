import { createContext, useContext } from 'react';
import type {
  ComplaintInput,
  HostelComplaint,
  OutpassInput,
  OutpassRequest,
  ReviewComplaintStatus,
  ReviewOutpassStatus,
} from '@supercampus/supabase';

export interface HostelContextValue {
  /** Resident's own outpass requests, most recent first. */
  myOutpasses: readonly OutpassRequest[];
  /** Resident's own complaints, most recent first. */
  myComplaints: readonly HostelComplaint[];
  /** Staff queue of outpass requests awaiting review. */
  pendingOutpasses: readonly OutpassRequest[];
  /** Staff queue of open complaints. */
  openComplaints: readonly HostelComplaint[];
  loading: boolean;
  error: string | null;
  canManageOutpasses: boolean;
  canManageComplaints: boolean;
  createOutpass: (input: OutpassInput) => Promise<boolean>;
  createComplaint: (input: ComplaintInput) => Promise<boolean>;
  reviewOutpass: (requestId: string, status: ReviewOutpassStatus) => Promise<boolean>;
  reviewComplaint: (complaintId: string, status: ReviewComplaintStatus) => Promise<boolean>;
  refresh: () => Promise<void>;
}

export const HostelContext = createContext<HostelContextValue | null>(null);

export function useHostel(): HostelContextValue {
  const value = useContext(HostelContext);
  if (!value) throw new Error('useHostel must be used inside HostelProvider');
  return value;
}