import type { SupercampusSupabaseClient } from './client.js';
import type { Tables } from './database.types.js';

export type RoleRequest = Tables<'role_requests'>;
export type RoleRequestStatus = RoleRequest['status'];

export interface RoleRequestProfile {
  display_name: string;
}

/** A role request enriched with the requested role, campus, and requester names. */
export interface RoleRequestWithRole extends RoleRequest {
  roles?: { key: string | null; name: string | null } | null;
  campuses?: { name: string | null } | null;
  profiles?: RoleRequestProfile | null;
}

export interface RoleRequestInput {
  roleId: string;
  roleKey: string;
  campusId: string;
}

export type RoleRequestResult<T> = { data: T; error: null } | { data: null; error: string };

export function createRoleRequestService(client: SupercampusSupabaseClient) {
  async function listMine(userId: string): Promise<RoleRequestResult<RoleRequest[]>> {
    const { data, error } = await client
      .from('role_requests')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    return error
      ? { data: null, error: 'Your role request could not be loaded.' }
      : { data, error: null };
  }

  async function listPending(): Promise<RoleRequestResult<RoleRequestWithRole[]>> {
    const { data, error } = await client
      .from('role_requests')
      .select(
        '*, roles(key,name), campuses(name), profiles!role_requests_user_id_fkey(display_name)',
      )
      .eq('status', 'pending')
      .order('created_at', { ascending: true });
    return error
      ? { data: null, error: 'Pending requests could not be loaded.' }
      : { data, error: null };
  }

  async function findRoleByKey(
    key: string,
  ): Promise<RoleRequestResult<{ id: string; key: string; name: string } | null>> {
    const { data, error } = await client
      .from('roles')
      .select('id,key,name')
      .eq('key', key)
      .maybeSingle();
    return error
      ? { data: null, error: 'The requested role could not be resolved.' }
      : { data, error: null };
  }

  async function create(
    userId: string,
    input: RoleRequestInput,
  ): Promise<RoleRequestResult<RoleRequest>> {
    const { data, error } = await client
      .from('role_requests')
      .insert({
        user_id: userId,
        requested_role_id: input.roleId,
        campus_id: input.campusId,
        status: 'pending',
      })
      .select()
      .single();
    return error
      ? { data: null, error: 'Your role request could not be submitted.' }
      : { data, error: null };
  }

  async function approve(
    requestId: string,
    reviewerId: string,
    assignment: { roleId?: string; campusId?: string },
  ): Promise<RoleRequestResult<RoleRequest>> {
    const { data: request, error: fetchError } = await client
      .from('role_requests')
      .select('*')
      .eq('id', requestId)
      .maybeSingle();
    if (fetchError || !request) {
      return { data: null, error: 'That request could not be found.' };
    }
    const roleId = assignment.roleId ?? request.requested_role_id;
    const campusId = assignment.campusId ?? request.campus_id;
    if (!roleId || !campusId) {
      return { data: null, error: 'A role and campus are required to approve this request.' };
    }
    const { error: grantError } = await client
      .from('user_roles')
      .upsert(
        { user_id: request.user_id, role_id: roleId, campus_id: campusId, granted_by: reviewerId },
        { onConflict: 'user_id,role_id,campus_id' },
      );
    if (grantError) {
      return { data: null, error: 'The role could not be assigned. Please try again.' };
    }
    const { data, error } = await client
      .from('role_requests')
      .update({
        status: 'approved',
        reviewed_by: reviewerId,
        reviewed_at: new Date().toISOString(),
        requested_role_id: roleId,
        campus_id: campusId,
      })
      .eq('id', requestId)
      .select()
      .single();
    return error
      ? { data: null, error: 'The request could not be updated.' }
      : { data, error: null };
  }

  async function reject(
    requestId: string,
    reviewerId: string,
    note?: string,
  ): Promise<RoleRequestResult<RoleRequest>> {
    const { data, error } = await client
      .from('role_requests')
      .update({
        status: 'rejected',
        reviewed_by: reviewerId,
        reviewed_at: new Date().toISOString(),
        rejection_reason: note?.trim() || null,
      })
      .eq('id', requestId)
      .select()
      .single();
    return error
      ? { data: null, error: 'The request could not be rejected.' }
      : { data, error: null };
  }

  return { create, listMine, listPending, findRoleByKey, approve, reject };
}

export type RoleRequestService = ReturnType<typeof createRoleRequestService>;
