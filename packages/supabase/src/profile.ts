import type { User } from '@supabase/supabase-js';
import type { SupercampusSupabaseClient } from './client.js';
import type { Tables, TablesUpdate } from './database.types.js';

export type Profile = Tables<'profiles'>;
export type ProfileUpdate = Pick<TablesUpdate<'profiles'>, 'avatar_asset_id' | 'bio' | 'campus_id' | 'department_id' | 'directory_visibility' | 'display_name' | 'family_name' | 'given_name' | 'graduation_year' | 'handle' | 'program_id'>;
export type ProfileResult<T> = { data: T; error: null } | { data: null; error: string };

function profileError(): string { return 'Your profile could not be loaded. Please try again.'; }

function defaultProfile(user: User): Pick<Profile, 'id' | 'handle' | 'display_name'> {
  const metadataName = typeof user.user_metadata.display_name === 'string' ? user.user_metadata.display_name.trim() : '';
  const localPart = user.email?.split('@')[0]?.replace(/[^a-z0-9_.-]/gi, '').toLowerCase() || 'user';
  return { id: user.id, display_name: metadataName || localPart, handle: `user-${user.id.replaceAll('-', '')}` };
}

export function createProfileService(client: SupercampusSupabaseClient) {
  async function find(userId: string): Promise<ProfileResult<Profile | null>> {
    const { data, error } = await client.from('profiles').select('*').eq('id', userId).maybeSingle();
    return error ? { data: null, error: profileError() } : { data, error: null };
  }

  return {
    async bootstrap(user: User): Promise<ProfileResult<Profile>> {
      const existing = await find(user.id);
      if (existing.error) return existing;
      if (existing.data) return { data: existing.data, error: null };
      const { data, error } = await client.from('profiles').upsert(defaultProfile(user), { onConflict: 'id' }).select().single();
      return error ? { data: null, error: profileError() } : { data, error: null };
    },
    async refresh(userId: string): Promise<ProfileResult<Profile | null>> { return find(userId); },
    async update(userId: string, changes: ProfileUpdate): Promise<ProfileResult<Profile>> {
      const { data, error } = await client.from('profiles').update(changes).eq('id', userId).select().single();
      return error ? { data: null, error: profileError() } : { data, error: null };
    },
  };
}

export type ProfileService = ReturnType<typeof createProfileService>;
