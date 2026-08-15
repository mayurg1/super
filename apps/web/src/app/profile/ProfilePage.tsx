import { useCallback, useEffect, useMemo, useState } from 'react';
import { Spinner } from '@supercampus/shared';
import {
  createProfileService,
  useAuth,
  useProfile,
  useSupabase,
} from '@supercampus/supabase';
import type {
  ProfileEducation,
  ProfileEducationInput,
  ProfileExperience,
  ProfileExperienceInput,
  ProfileUpdate,
  Skill,
} from '@supercampus/supabase';
import { ProfileEditForm } from './ProfileEditForm';
import { ProfileHero } from './ProfileHero';
import { EducationSection } from './EducationSection';
import { ExperienceSection } from './ExperienceSection';
import { SkillsSection } from './SkillsSection';
import type { OwnedSkill } from './SkillsSection';

export function ProfilePage(): React.ReactElement {
  const { user } = useAuth();
  const client = useSupabase();
  const { profile, loading: profileLoading, refreshProfile } = useProfile();
  const service = useMemo(() => createProfileService(client), [client]);

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [educations, setEducations] = useState<ProfileEducation[]>([]);
  const [experiences, setExperiences] = useState<ProfileExperience[]>([]);
  const [ownedSkills, setOwnedSkills] = useState<OwnedSkill[]>([]);
  const [catalog, setCatalog] = useState<Skill[]>([]);

  const flash = useCallback((kind: 'ok' | 'error', text: string): void => {
    setMessage(kind === 'ok' ? text : null);
    setError(kind === 'error' ? text : null);
  }, []);

  const loadDetails = useCallback(async (profileId: string): Promise<void> => {
    const [eduRes, expRes, skillRes, catalogRes] = await Promise.all([
      service.listEducations(profileId),
      service.listExperiences(profileId),
      service.listProfileSkills(profileId),
      service.searchSkills(''),
    ]);
    if (eduRes.data && !eduRes.error) setEducations(eduRes.data);
    if (expRes.data && !expRes.error) setExperiences(expRes.data);
    if (skillRes.data && !skillRes.error) {
      setOwnedSkills(skillRes.data.map((entry) => ({
        skillId: entry.skill_id,
        name: entry.skill?.name ?? '',
      })));
    }
    if (catalogRes.data && !catalogRes.error) setCatalog(catalogRes.data);
  }, [service]);

  const loadAvatar = useCallback(async (assetId: string | null): Promise<void> => {
    if (!assetId) { setAvatarUrl(null); return; }
    const url = await service.getAssetUrl(assetId);
    setAvatarUrl(url);
  }, [service]);

  useEffect(() => {
    if (!profile) return;
    void loadAvatar(profile.avatar_asset_id ?? null);
    void loadDetails(profile.id);
  }, [profile, loadAvatar, loadDetails]);

  const handleAvatarFile = useCallback(async (file: File): Promise<void> => {
    if (!user) return;
    setUploading(true);
    flash('ok', 'Uploading avatar…');
    const result = await service.uploadAvatar(user.id, file);
    setUploading(false);
    if (result.error) { flash('error', result.error); return; }
    await refreshProfile();
    if (result.data) void loadAvatar(result.data.avatar_asset_id ?? null);
    flash('ok', 'Avatar updated.');
  }, [user, service, refreshProfile, loadAvatar, flash]);

  const handleSaveDetails = useCallback(async (changes: ProfileUpdate): Promise<boolean> => {
    if (!user) return false;
    setSaving(true);
    const result = await service.update(user.id, changes);
    setSaving(false);
    if (result.error) { flash('error', result.error); return false; }
    await refreshProfile();
    flash('ok', 'Profile saved.');
    setEditing(false);
    return true;
  }, [user, service, refreshProfile, flash]);

  // ── Section actions ──────────────────────────────────────────────────────
  const withReload = useCallback(async <T,>(
    action: () => Promise<{ data: T | null; error: string | null }>,
    profileId: string,
  ): Promise<boolean> => {
    const result = await action();
    if (result.error) { flash('error', result.error); return false; }
    await loadDetails(profileId);
    return true;
  }, [loadDetails, flash]);

  const addEducation = (input: ProfileEducationInput): Promise<boolean> =>
    profile ? withReload(() => service.createEducation(profile.id, input), profile.id) : Promise.resolve(false);
  const updateEducation = (id: string, input: ProfileEducationInput): Promise<boolean> =>
    profile ? withReload(() => service.updateEducation(id, input), profile.id) : Promise.resolve(false);
  const deleteEducation = (id: string): Promise<boolean> =>
    profile ? withReload(() => service.deleteEducation(id), profile.id) : Promise.resolve(false);

  const addExperience = (input: ProfileExperienceInput): Promise<boolean> =>
    profile ? withReload(() => service.createExperience(profile.id, input), profile.id) : Promise.resolve(false);
  const updateExperience = (id: string, input: ProfileExperienceInput): Promise<boolean> =>
    profile ? withReload(() => service.updateExperience(id, input), profile.id) : Promise.resolve(false);
  const deleteExperience = (id: string): Promise<boolean> =>
    profile ? withReload(() => service.deleteExperience(id), profile.id) : Promise.resolve(false);

  const addSkill = (name: string): Promise<boolean> =>
    profile ? withReload(() => service.addProfileSkill(profile.id, name), profile.id) : Promise.resolve(false);
  const removeSkill = (skillId: string): Promise<boolean> =>
    profile ? withReload(() => service.removeProfileSkill(profile.id, skillId), profile.id) : Promise.resolve(false);

  if (profileLoading) return <Spinner label="Loading profile" />;
  if (!profile || !user) return <p className="sc-profile-empty">Profile unavailable.</p>;

  return (
    <div className="sc-profile">
      {message ? <p className="sc-profile-toast sc-profile-toast-ok" role="status">{message}</p> : null}
      {error ? <p className="sc-profile-toast sc-profile-toast-error" role="alert">{error}</p> : null}

      {editing ? (
        <ProfileEditForm
          profile={profile}
          onCancel={() => setEditing(false)}
          onSave={handleSaveDetails}
          saving={saving}
        />
      ) : (
        <ProfileHero
          avatarUrl={avatarUrl}
          profile={profile}
          onEdit={() => setEditing(true)}
          onUploadFile={(file) => void handleAvatarFile(file)}
          uploading={uploading}
        />
      )}

      <EducationSection
        items={educations}
        onAdd={addEducation}
        onUpdate={updateEducation}
        onDelete={deleteEducation}
      />
      <ExperienceSection
        items={experiences}
        onAdd={addExperience}
        onUpdate={updateExperience}
        onDelete={deleteExperience}
      />
      <SkillsSection catalog={catalog} owned={ownedSkills} onAdd={addSkill} onRemove={removeSkill} />
    </div>
  );
}