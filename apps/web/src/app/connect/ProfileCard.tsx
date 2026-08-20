import { Link } from 'react-router-dom';
import { Card } from '@supercampus/shared';
import { ROUTES } from '@supercampus/core';
import { DirectoryProfile } from '@supercampus/supabase';

export function ProfileCard({ profile }: { profile: DirectoryProfile }): React.ReactElement {
  return (
    <Card className="sc-connect-profile-card">
      <Link className="sc-connect-profile-link" to={`${ROUTES.connectProfile.replace(':userId', profile.id)}`}>
        <div style={{ fontWeight: 600 }}>{profile.displayName}</div>
        {profile.graduationYear && (
          <div style={{ fontSize: 13, color: 'var(--sc-text-secondary)' }}>
            {profile.graduationYear}
          </div>
        )}
        {profile.bio && (
          <div style={{ fontSize: 13, color: 'var(--sc-text-secondary)' }}>
            {profile.bio}
          </div>
        )}
      </Link>
    </Card>
  );
}