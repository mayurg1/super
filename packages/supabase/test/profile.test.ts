import { describe, expect, it } from 'vitest';
import { createMockClient } from './helpers/mockClient';
import { createProfileService } from '../src/profile';

type Client = Parameters<typeof createProfileService>[0];

const USER = {
  id: 'user-1',
  email: 'a@example.com',
  user_metadata: { display_name: 'Ada' },
};

const PROFILE_ROW = {
  id: 'user-1',
  handle: 'user-user-1',
  display_name: 'Ada',
  bio: 'Engineer',
  campus_id: 'campus-1',
  directory_visibility: 'campus',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  availability_status: 'available',
  business_name: null,
  deleted_at: null,
  department_id: null,
  designation: null,
  family_name: null,
  given_name: null,
  graduation_year: null,
  headline: null,
  is_active: true,
  phone: null,
  privacy_consent_at: null,
  program_id: null,
  residency_type: null,
  website_url: null,
};

describe('createProfileService', () => {
  it('bootstrap returns an existing profile', async () => {
    const client = createMockClient({
      profiles: () => ({ data: PROFILE_ROW, error: null }),
    });
    const service = createProfileService(client as unknown as Client);

    const result = await service.bootstrap(USER as never);
    expect(result.error).toBeNull();
    expect(result.data?.id).toBe('user-1');
    expect(result.data?.display_name).toBe('Ada');
  });

  it('bootstrap creates a profile for a new user', async () => {
    const client = createMockClient({
      profiles: (call) =>
        call === 1
          ? { data: null, error: null }
          : { data: PROFILE_ROW, error: null },
    });
    const service = createProfileService(client as unknown as Client);

    const result = await service.bootstrap(USER as never);
    expect(result.error).toBeNull();
    expect(result.data?.id).toBe('user-1');
  });

  it('update persists changes and returns the updated profile', async () => {
    const client = createMockClient({
      profiles: () => ({ data: { ...PROFILE_ROW, bio: 'Senior Engineer' }, error: null }),
    });
    const service = createProfileService(client as unknown as Client);

    const result = await service.update('user-1', { bio: 'Senior Engineer' });
    expect(result.error).toBeNull();
    expect(result.data?.bio).toBe('Senior Engineer');
  });

  it('update returns an error when the write fails', async () => {
    const client = createMockClient({
      profiles: () => ({ data: null, error: { message: 'constraint violation' } }),
    });
    const service = createProfileService(client as unknown as Client);

    const result = await service.update('user-1', { bio: 'x' });
    expect(result.error).toContain('could not be saved');
    expect(result.data).toBeNull();
  });
});