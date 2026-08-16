import type { SupercampusSupabaseClient } from './client.js';
import type { Tables } from './database.types.js';

export type OutpassRequest = Tables<'outpass_requests'>;
export type HostelComplaint = Tables<'hostel_complaints'>;

export type ReviewOutpassStatus = 'approved' | 'rejected';
export type ReviewComplaintStatus = 'open' | 'assigned' | 'resolved';

export interface OutpassInput {
  destination: string;
  reason: string;
  departAt: string;
  returnAt: string;
}

export interface ComplaintInput {
  roomId?: string | null;
  category: string;
  description: string;
}

export type HostelResult<T> = { data: T; error: null } | { data: null; error: string };

/** Best-effort date parse; returns null when the string is not a valid timestamp. */
function toEpoch(value: string): number | null {
  const time = Date.parse(value);
  return Number.isNaN(time) ? null : time;
}

function outpassError(): string {
  return 'Your outpass request could not be submitted. Please try again.';
}

function complaintError(): string {
  return 'Your complaint could not be submitted. Please try again.';
}

function writeError(): string {
  return 'Your request could not be saved. Please try again.';
}

/**
 * Hostel Outpass + Complaints service façade.
 * Residents self-insert/read their own rows via RLS (resident_id = auth.uid());
 * hostel_staff / campus_admin manage rows via the hostel.outpasses.manage and
 * hostel.complaints.manage permissions. Room browser / attendance / QR stay out of scope.
 */
export function createHostelService(client: SupercampusSupabaseClient) {
  async function createOutpassRequest(
    residentId: string,
    input: OutpassInput,
  ): Promise<HostelResult<OutpassRequest>> {
    const destination = input.destination.trim();
    const reason = input.reason.trim();
    const departAt = input.departAt;
    const returnAt = input.returnAt;

    if (!destination) return { data: null, error: 'Please tell us where you are going.' };
    if (!reason) return { data: null, error: 'Please add a short reason for the leave.' };
    if (!departAt || !returnAt) {
      return { data: null, error: 'Please pick both departure and return times.' };
    }

    // Friendly client-side check before hitting RLS — mirrors the DB `outpass_dates` constraint.
    const departTime = toEpoch(departAt);
    const returnTime = toEpoch(returnAt);
    if (departTime === null || returnTime === null) {
      return { data: null, error: 'Please enter valid departure and return times.' };
    }
    if (returnTime <= departTime) {
      return { data: null, error: 'Return time must be after the departure time.' };
    }

    const { data, error } = await client
      .from('outpass_requests')
      .insert({
        resident_id: residentId,
        destination,
        reason,
        depart_at: departAt,
        return_at: returnAt,
        status: 'pending',
      })
      .select()
      .single();
    return error ? { data: null, error: outpassError() } : { data, error: null };
  }

  async function getMyOutpassRequests(
    residentId: string,
  ): Promise<HostelResult<OutpassRequest[]>> {
    const { data, error } = await client
      .from('outpass_requests')
      .select('*')
      .eq('resident_id', residentId)
      .order('created_at', { ascending: false });
    return error
      ? { data: null, error: 'Your outpass requests could not be loaded.' }
      : { data, error: null };
  }

  async function getPendingOutpassRequests(): Promise<HostelResult<OutpassRequest[]>> {
    const { data, error } = await client
      .from('outpass_requests')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true });
    return error
      ? { data: null, error: 'Pending outpass requests could not be loaded.' }
      : { data, error: null };
  }

  async function reviewOutpassRequest(
    requestId: string,
    reviewerId: string,
    status: ReviewOutpassStatus,
    _note?: string,
  ): Promise<HostelResult<OutpassRequest>> {
    const { data, error } = await client
      .from('outpass_requests')
      .update({ status, reviewer_id: reviewerId, updated_at: new Date().toISOString() })
      .eq('id', requestId)
      .select()
      .single();
    return error || !data ? { data: null, error: writeError() } : { data, error: null };
  }

  async function createComplaint(
    residentId: string,
    input: ComplaintInput,
  ): Promise<HostelResult<HostelComplaint>> {
    const category = input.category.trim();
    const description = input.description.trim();

    if (!category) return { data: null, error: 'Please choose a complaint category.' };
    if (!description) {
      return { data: null, error: 'Please describe the issue you are facing.' };
    }

    const { data, error } = await client
      .from('hostel_complaints')
      .insert({
        resident_id: residentId,
        room_id: input.roomId ?? null,
        category,
        description,
        status: 'open',
      })
      .select()
      .single();
    return error ? { data: null, error: complaintError() } : { data, error: null };
  }

  async function getMyComplaints(
    residentId: string,
  ): Promise<HostelResult<HostelComplaint[]>> {
    const { data, error } = await client
      .from('hostel_complaints')
      .select('*')
      .eq('resident_id', residentId)
      .order('created_at', { ascending: false });
    return error
      ? { data: null, error: 'Your complaints could not be loaded.' }
      : { data, error: null };
  }

  async function getOpenComplaints(): Promise<HostelResult<HostelComplaint[]>> {
    const { data, error } = await client
      .from('hostel_complaints')
      .select('*')
      .eq('status', 'open')
      .order('created_at', { ascending: true });
    return error
      ? { data: null, error: 'Open complaints could not be loaded.' }
      : { data, error: null };
  }

  async function reviewComplaint(
    complaintId: string,
    assigneeId: string | null,
    status: ReviewComplaintStatus,
    _note?: string,
  ): Promise<HostelResult<HostelComplaint>> {
    const { data, error } = await client
      .from('hostel_complaints')
      .update({ status, assignee_id: assigneeId, updated_at: new Date().toISOString() })
      .eq('id', complaintId)
      .select()
      .single();
    return error || !data ? { data: null, error: writeError() } : { data, error: null };
  }

  return {
    createOutpassRequest,
    getMyOutpassRequests,
    getPendingOutpassRequests,
    reviewOutpassRequest,
    createComplaint,
    getMyComplaints,
    getOpenComplaints,
    reviewComplaint,
  };
}

export type HostelService = ReturnType<typeof createHostelService>;
