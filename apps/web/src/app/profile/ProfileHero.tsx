import { Button, Card } from '@supercampus/shared';
import type { Profile } from '@supercampus/supabase';
import { AvatarUpload } from './AvatarUpload';

/** View-mode hero: avatar + name/handle/bio/graduation year. */
export function ProfileHero({
  avatarUrl,
  profile,
  onEdit,
  onUploadFile,
  uploading,
}: {
  avatarUrl: string | null;
  profile: Profile;
  onEdit: () => void;
  onUploadFile: (file: File) => void;
  uploading: boolean;
}): React.ReactElement {
  return (
    <Card className="sc-profile-hero">
      <div className="sc-profile-hero-main">
        <AvatarUpload src={avatarUrl} name={profile.display_name} onFile={onUploadFile} busy={uploading} />
        <div className="sc-profile-hero-info">
          <h2>{profile.display_name}</h2>
          <p className="sc-profile-handle">@{profile.handle}</p>
          {profile.bio ? <p className="sc-profile-bio">{profile.bio}</p> : null}
          <p className="sc-profile-meta">
            {profile.graduation_year ? `🎓 Batch ${profile.graduation_year}` : ''}
            {profile.directory_visibility ? ` · ${profile.directory_visibility} profile` : ''}
          </p>
        </div>
      </div>
      <Button type="button" variant="outline" size="sm" onClick={onEdit}>
        ✏️ Edit profile
      </Button>
    </Card>
  );
}