import type { User } from '@supabase/supabase-js';
import type { SupercampusSupabaseClient } from './client.js';
import type { Tables, TablesInsert, TablesUpdate } from './database.types.js';

export type Profile = Tables<'profiles'>;
export type ProfileUpdate = Pick<TablesUpdate<'profiles'>, 'avatar_asset_id' | 'bio' | 'campus_id' | 'department_id' | 'directory_visibility' | 'display_name' | 'family_name' | 'given_name' | 'graduation_year' | 'handle' | 'program_id'>;
export type ProfileResult<T> = { data: T; error: null } | { data: null; error: string };

export type ProfileEducation = Tables<'profile_educations'>;
export type ProfileEducationInput = Pick<TablesInsert<'profile_educations'>, 'institution' | 'program' | 'started_on' | 'ended_on'>;

export type ProfileExperience = Tables<'profile_experiences'>;
export type ProfileExperienceInput = Pick<TablesInsert<'profile_experiences'>, 'employer' | 'title' | 'started_on' | 'ended_on' | 'is_current' | 'visibility'>;

export type Skill = Tables<'skills'>;
export type ProfileSkill = Tables<'profile_skills'>;

export type UserSettings = Tables<'user_settings'>;
export type UserSettingsUpdate = Pick<TablesUpdate<'user_settings'>, 'theme' | 'locale' | 'email_notifications' | 'push_notifications' | 'preferences'>;

function profileError(): string { return 'Your profile could not be loaded. Please try again.'; }
function profileWriteError(): string { return 'Your profile could not be saved. Please try again.'; }
const AVATARS_BUCKET = 'avatars' as const;

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
      return error ? { data: null, error: profileWriteError() } : { data, error: null };
    },

    // ── Avatar ─────────────────────────────────────────────────────────────
    async uploadAvatar(userId: string, file: File): Promise<ProfileResult<Profile>> {
      const ext = (file.name.split('.').pop() ?? 'jpg').toLowerCase().replace(/[^a-z0-9]/gi, '');
      const objectPath = `${userId}/${crypto.randomUUID()}.${ext || 'jpg'}`;
      const { error: uploadError } = await client.storage
        .from(AVATARS_BUCKET)
        .upload(objectPath, file, { contentType: file.type || 'image/jpeg', upsert: false });
      if (uploadError) return { data: null, error: 'Your avatar could not be uploaded. Please try again.' };
      const { data: asset, error: insertError } = await client
        .from('media_assets')
        .insert({ owner_id: userId, bucket: AVATARS_BUCKET, object_path: objectPath, mime_type: file.type || 'image/jpeg', byte_size: file.size, status: 'pending' })
        .select('id')
        .single();
      if (insertError || !asset) {
        await client.storage.from(AVATARS_BUCKET).remove([objectPath]);
        return { data: null, error: 'Your avatar could not be saved. Please try again.' };
      }
      await client.from('media_assets').update({ status: 'active' }).eq('id', asset.id);
      const { data: updatedProfile, error: profileUpdateError } = await client
        .from('profiles')
        .update({ avatar_asset_id: asset.id })
        .eq('id', userId)
        .select()
        .single();
      return profileUpdateError || !updatedProfile
        ? { data: null, error: 'Your avatar was uploaded but could not be attached. Please try again.' }
        : { data: updatedProfile, error: null };
    },

    async getAssetUrl(assetId: string): Promise<string | null> {
      if (!assetId) return null;
      const { data, error } = await client.from('media_assets').select('bucket, object_path').eq('id', assetId).maybeSingle();
      if (error || !data) return null;
      const { data: signed } = await client.storage.from(data.bucket).createSignedUrl(data.object_path, 3600);
      return signed?.signedUrl ?? null;
    },
// ── Education ──────────────────────────────────────────────────────────
    async listEducations(profileId: string): Promise<ProfileResult<ProfileEducation[]>> {
      const { data, error } = await client.from('profile_educations').select('*').eq('profile_id', profileId).order('started_on', { ascending: false, nullsFirst: false });
      return error ? { data: null, error: profileError() } : { data, error: null };
    },
    async createEducation(profileId: string, input: ProfileEducationInput): Promise<ProfileResult<ProfileEducation>> {
      const { data, error } = await client.from('profile_educations').insert({
        profile_id: profileId,
        institution: input.institution,
        program: input.program,
        started_on: input.started_on,
        ended_on: input.ended_on,
      }).select().single();
      return error ? { data: null, error: profileWriteError() } : { data, error: null };
    },
    async updateEducation(id: string, changes: ProfileEducationInput): Promise<ProfileResult<ProfileEducation>> {
      const { data, error } = await client.from('profile_educations').update({
        institution: changes.institution,
        program: changes.program,
        started_on: changes.started_on,
        ended_on: changes.ended_on,
      }).eq('id', id).select().single();
      return error ? { data: null, error: profileWriteError() } : { data, error: null };
    },
    async deleteEducation(id: string): Promise<ProfileResult<null>> {
      const { error } = await client.from('profile_educations').delete().eq('id', id);
      return error ? { data: null, error: profileWriteError() } : { data: null, error: null };
    },

    // ── Experience ─────────────────────────────────────────────────────────
    async listExperiences(profileId: string): Promise<ProfileResult<ProfileExperience[]>> {
      const { data, error } = await client.from('profile_experiences').select('*').eq('profile_id', profileId).order('started_on', { ascending: false, nullsFirst: false });
      return error ? { data: null, error: profileError() } : { data, error: null };
    },
    async createExperience(profileId: string, input: ProfileExperienceInput): Promise<ProfileResult<ProfileExperience>> {
      const { data, error } = await client.from('profile_experiences').insert({
        profile_id: profileId,
        employer: input.employer,
        title: input.title,
        started_on: input.started_on,
        ended_on: input.ended_on,
        is_current: input.is_current,
        visibility: input.visibility,
      }).select().single();
      return error ? { data: null, error: profileWriteError() } : { data, error: null };
    },
    async updateExperience(id: string, changes: ProfileExperienceInput): Promise<ProfileResult<ProfileExperience>> {
      const { data, error } = await client.from('profile_experiences').update({
        employer: changes.employer,
        title: changes.title,
        started_on: changes.started_on,
        ended_on: changes.ended_on,
        is_current: changes.is_current,
        visibility: changes.visibility,
      }).eq('id', id).select().single();
      return error ? { data: null, error: profileWriteError() } : { data, error: null };
    },
    async deleteExperience(id: string): Promise<ProfileResult<null>> {
      const { error } = await client.from('profile_experiences').delete().eq('id', id);
      return error ? { data: null, error: profileWriteError() } : { data: null, error: null };
    },

    // ── Skills ─────────────────────────────────────────────────────────────
    async searchSkills(query: string, limit = 12): Promise<ProfileResult<Skill[]>> {
      const q = query.trim();
      let request = client.from('skills').select('*');
      if (q) request = request.ilike('name', `%${q}%`);
      const { data, error } = await request.order('name', { ascending: true }).limit(limit);
      return error ? { data: null, error: 'Skills could not be loaded.' } : { data, error: null };
    },
    async listProfileSkills(profileId: string): Promise<ProfileResult<(ProfileSkill & { skill: Pick<Skill, 'id' | 'name' | 'category'> | null })[]>> {
      const { data, error } = await client
        .from('profile_skills')
        .select('profile_id, skill_id, proficiency, created_at, skills:skills(id, name, category)')
        .eq('profile_id', profileId);
      if (error) return { data: null, error: profileError() };
      const mapped = (data ?? []).map((row) => ({
        profile_id: row.profile_id,
        skill_id: row.skill_id as string,
        proficiency: row.proficiency as number | null,
        created_at: row.created_at as string,
        skill: (row.skills as unknown as Pick<Skill, 'id' | 'name' | 'category'> | null),
      }));
      return { data: mapped, error: null };
    },
    async addProfileSkill(profileId: string, name: string, proficiency: number | null = null): Promise<ProfileResult<null>> {
      const normalized = name.trim().replace(/\s+/g, ' ');
      if (!normalized) return { data: null, error: 'Skill name is required.' };
      const { data: existing } = await client.from('skills').select('id').ilike('name', normalized).limit(1).maybeSingle();
      let skillId = existing?.id ?? null;
      if (!skillId) {
        const { data: created, error: insertError } = await client.from('skills').insert({ name: normalized }).select('id').single();
        if (insertError || !created) return { data: null, error: profileWriteError() };
        skillId = created.id;
      }
      const { error } = await client.from('profile_skills').upsert({ profile_id: profileId, skill_id: skillId, proficiency });
      return error ? { data: null, error: profileWriteError() } : { data: null, error: null };
    },
    async removeProfileSkill(profileId: string, skillId: string): Promise<ProfileResult<null>> {
      const { error } = await client.from('profile_skills').delete().eq('profile_id', profileId).eq('skill_id', skillId);
      return error ? { data: null, error: profileWriteError() } : { data: null, error: null };
    },

    // ── User settings ──────────────────────────────────────────────────────
    async getSettings(userId: string): Promise<ProfileResult<UserSettings>> {
      const { data, error } = await client.from('user_settings').select('*').eq('user_id', userId).maybeSingle();
      if (error) return { data: null, error: profileError() };
      if (data) return { data, error: null };
      const { data: created, error: insertError } = await client.from('user_settings').insert({ user_id: userId }).select().single();
      return insertError ? { data: null, error: profileError() } : { data: created, error: null };
    },
    async updateSettings(userId: string, changes: UserSettingsUpdate): Promise<ProfileResult<UserSettings>> {
      const { data, error } = await client.from('user_settings').update(changes).eq('user_id', userId).select().single();
      return error ? { data: null, error: profileWriteError() } : { data, error: null };
    },
  };
}

export type ProfileService = ReturnType<typeof createProfileService>;
