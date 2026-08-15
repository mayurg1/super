import { useState } from 'react';
import { Button, Card, Input } from '@supercampus/shared';
import type { Profile, ProfileUpdate } from '@supercampus/supabase';

const HANDLE_RE = /^[a-z0-9][a-z0-9_.-]{2,31}$/;

export function ProfileEditForm({
  profile,
  onCancel,
  onSave,
  saving,
}: {
  profile: Profile;
  onCancel: () => void;
  onSave: (changes: ProfileUpdate) => Promise<boolean>;
  saving: boolean;
}): React.ReactElement {
  const [givenName, setGivenName] = useState(profile.given_name ?? '');
  const [familyName, setFamilyName] = useState(profile.family_name ?? '');
  const [displayName, setDisplayName] = useState(profile.display_name);
  const [handle, setHandle] = useState(profile.handle);
  const [bio, setBio] = useState(profile.bio ?? '');
  const [graduationYear, setGraduationYear] = useState(profile.graduation_year ? String(profile.graduation_year) : '');
  const [visibility, setVisibility] = useState(profile.directory_visibility ?? 'campus');

  const handleValid = HANDLE_RE.test(handle.trim());
  const valid = displayName.trim() !== '' && handleValid;
  const handleError = !handleValid
    ? 'Handles must be 3–32 chars of lowercase letters, numbers, dots, dashes or underscores.'
    : undefined;

  const submit = async (): Promise<void> => {
    if (!valid) return;
    const changes: ProfileUpdate = {
      given_name: givenName.trim() || null,
      family_name: familyName.trim() || null,
      display_name: displayName.trim(),
      handle: handle.trim().toLowerCase(),
      bio,
      graduation_year: graduationYear ? Number(graduationYear) : null,
      directory_visibility: visibility,
    };
    const ok = await onSave(changes);
    if (ok) onCancel();
  };

  return (
    <Card className="sc-profile-section">
      <div className="sc-profile-section-head">
        <h3>👤 Profile details</h3>
      </div>
      <div className="sc-profile-form">
        <div className="sc-profile-form-grid">
          <Input label="Given name" value={givenName} onChange={(e) => setGivenName(e.target.value)} />
          <Input label="Family name" value={familyName} onChange={(e) => setFamilyName(e.target.value)} />
          <Input label="Display name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
          <Input label="Handle" value={handle} onChange={(e) => setHandle(e.target.value)} error={handleError} />
          <Input
            label="Graduation year"
            type="number"
            min={1950}
            max={2200}
            value={graduationYear}
            onChange={(e) => setGraduationYear(e.target.value)}
          />
          <label className="sc-field">
            <span className="sc-field-label">Directory visibility</span>
            <select className="sc-input" value={visibility} onChange={(e) => setVisibility(e.target.value)}>
              <option value="private">Private — only you</option>
              <option value="campus">Campus — your campus only</option>
              <option value="public">Public — everyone</option>
            </select>
          </label>
        </div>
        <label className="sc-field">
          <span className="sc-field-label">Bio</span>
          <textarea
            className="sc-input sc-input-textarea"
            rows={3}
            maxLength={500}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell your campus a little about yourself…"
          />
        </label>
        <div className="sc-profile-form-actions">
          <Button type="submit" size="sm" disabled={!valid || saving} onClick={() => void submit()}>
            {saving ? 'Saving…' : 'Save changes'}
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>Cancel</Button>
        </div>
      </div>
    </Card>
  );
}