import { describe, expect, it } from 'vitest';
import { createMockClient } from './helpers/mockClient';
import { createRoleRequestService } from '../src/roleRequests';

type Client = Parameters<typeof createRoleRequestService>[0];

describe('createRoleRequestService', () => {
  it('listMine returns role requests for the caller', async () => {
    const client = createMockClient({
      role_requests: () => ({
        data: [
          {
            id: 'req-1',
            user_id: 'user-1',
            requested_role_id: 'role-1',
            campus_id: 'campus-1',
            status: 'pending',
            created_at: '2026-01-01T00:00:00Z',
            updated_at: '2026-01-01T00:00:00Z',
          },
        ],
        error: null,
      }),
    });
    const service = createRoleRequestService(client as unknown as Client);

    const result = await service.listMine('user-1');
    expect(result.error).toBeNull();
    expect(result.data).toHaveLength(1);
    expect(result.data?.[0].id).toBe('req-1');
    expect(result.data?.[0].status).toBe('pending');
  });

  it('listMine returns an error when the query fails', async () => {
    const client = createMockClient({
      role_requests: () => ({ data: null, error: { message: 'db down' } }),
    });
    const service = createRoleRequestService(client as unknown as Client);

    const result = await service.listMine('user-1');
    expect(result.error).toContain('could not be loaded');
    expect(result.data).toBeNull();
  });

  it('findRoleByKey returns the matching role', async () => {
    const client = createMockClient({
      roles: () => ({ data: { id: 'role-1', key: 'student', name: 'Student' }, error: null }),
    });
    const service = createRoleRequestService(client as unknown as Client);

    const result = await service.findRoleByKey('student');
    expect(result.error).toBeNull();
    expect(result.data?.key).toBe('student');
  });
});