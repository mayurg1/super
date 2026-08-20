import { describe, expect, it } from 'vitest';
import { createMockClient } from './helpers/mockClient';
import { createAuthorizationService } from '../src/authorization';

const STUDENT_ROLE = {
  role_id: 'role-1',
  campus_id: 'campus-1',
  expires_at: null,
  roles: { id: 'role-1', key: 'student', name: 'Student' },
};

describe('createAuthorizationService', () => {
  it('load returns roles, permissions, and features for a user', async () => {
    const client = createMockClient({
      user_roles: () => ({ data: [STUDENT_ROLE], error: null }),
      role_permissions: () => ({
        data: [{ permissions: { key: 'posts.read' } }],
        error: null,
      }),
      role_features: () => ({
        data: [
          {
            feature_registry: {
              key: 'feed',
              name: 'Feed',
              description: 'Campus social feed',
              module_group: 'social',
              icon: '📰',
              route: '/home',
              sort_order: 10,
              is_enabled: true,
            },
          },
        ],
        error: null,
      }),
    });
    const service = createAuthorizationService(
      client as unknown as Parameters<typeof createAuthorizationService>[0],
    );

    const result = await service.load('u-happy', 'campus-1');
    expect(result.error).toBeNull();
    expect(result.data.roles.map((r) => r.key)).toEqual(['student']);
    expect(result.data.permissions).toEqual(['posts.read']);
    expect(result.data.features.map((f) => f.key)).toEqual(['feed']);
  });

  it('load returns an empty snapshot and an error when the role query fails', async () => {
    const client = createMockClient({
      user_roles: () => ({ data: null, error: { message: 'db down' } }),
    });
    const service = createAuthorizationService(
      client as unknown as Parameters<typeof createAuthorizationService>[0],
    );

    const result = await service.load('u-error', 'campus-1');
    expect(result.error).toContain('could not be loaded');
    expect(result.data.roles).toEqual([]);
    expect(result.data.permissions).toEqual([]);
    expect(result.data.features).toEqual([]);
  });

  it('load treats expired role grants as absent', async () => {
    const expired = {
      ...STUDENT_ROLE,
      expires_at: '2000-01-01T00:00:00Z',
    };
    const client = createMockClient({
      user_roles: () => ({ data: [expired], error: null }),
    });
    const service = createAuthorizationService(
      client as unknown as Parameters<typeof createAuthorizationService>[0],
    );

    const result = await service.load('u-expired', 'campus-1');
    expect(result.error).toBeNull();
    expect(result.data.roles).toEqual([]);
  });
});