import { describe, expect, it } from 'vitest';
import { createDirectoryService } from '../src/directory';

type MockResult = { data: unknown; error: unknown };

/**
 * Minimal Supabase-shaped mock for directory tests. The service uses
 * client.rpc (0036 SECURITY DEFINER helpers) instead of reading user_roles
 * directly, so the mock routes rpc() to per-name handlers.
 */
function createRpcClient(handlers: Record<string, () => MockResult>): {
  from: (table: string) => {
    select: (cols: string) => {
      eq: (col: string, value: unknown) => {
        single: () => Promise<MockResult>;
        maybeSingle: () => Promise<MockResult>;
      };
    };
  };
  rpc: (name: string) => Promise<MockResult>;
} {
  const tableResult: MockResult = { data: { id: 'profiles' }, error: null };
  const end = () => Promise.resolve(tableResult);
  return {
    from: () => ({
      select: () => ({
        eq: () => ({ single: end, maybeSingle: end }),
      }),
    }),
    rpc: (name: string) => Promise.resolve(handlers[name]?.() ?? { data: null, error: null }),
  };
}

describe('createDirectoryService', () => {
  const baseClient = (roleRows: unknown) => createRpcClient({
    list_directory_profiles: () => ({ data: roleRows, error: null }),
    get_directory_user_role: () => ({ data: { role_key: 'alumni', role_label: 'Alumni' }, error: null }),
  });

  it('getPeopleByRole maps RPC rows to DirectoryProfiles with role keys', async () => {
    const client = baseClient([
      {
        profile_id: 'user-1',
        display_name: 'Alice',
        handle: 'alice',
        given_name: 'Alice',
        family_name: null,
        bio: 'hi',
        avatar_asset_id: null,
        graduation_year: 2024,
        directory_visibility: 'campus',
        campus_id: null,
        created_at: '2026-01-01T00:00:00Z',
        role_key: 'alumni',
        role_label: 'Alumni',
      },
    ]);
    const service = createDirectoryService(client as never);

    const result = await service.getPeopleByRole('alumni', {});
    expect(result.error).toBeNull();
    expect(result.data?.profiles).toHaveLength(1);
    expect(result.data?.profiles[0].roleKey).toBe('alumni');
  });

  it('getPublicProfile resolves the visible role through the RPC', async () => {
    const client = baseClient([]);
    const service = createDirectoryService(client as never);

    const result = await service.getPublicProfile('user-1');
    expect(result.error).toBeNull();
    expect(result.data).toMatchObject({
      id: 'profiles',
      roleKey: 'alumni',
      roleLabel: 'Alumni',
    });
  });
});