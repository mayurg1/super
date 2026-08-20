import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button, Card, EmptyState, Spinner } from '@supercampus/shared';
import { ROUTES } from '@supercampus/core';
import {
  createChatService,
  createDirectoryService,
  createProfileService,
  useAuth,
  useSupabase,
  type PublicProfile,
} from '@supercampus/supabase';

export function ProfileDetailPage(): React.ReactElement {
  const { userId = '' } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const client = useSupabase();
  const { user } = useAuth();
  const directory = useMemo(() => createDirectoryService(client), [client]);
  const profileService = useMemo(() => createProfileService(client), [client]);
  const chat = useMemo(() => createChatService(client), [client]);

  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [messaging, setMessaging] = useState(false);
  const [messageError, setMessageError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    let active = true;
    setLoading(true);
    setError(null);
    void directory.getPublicProfile(userId).then(async (result) => {
      if (!active) return;
      if (!result.data) { setLoading(false); setError(result.error ?? 'This profile is not available.'); return; }
      setProfile(result.data);
      if (result.data.avatarAssetId) {
        const url = await profileService.getAssetUrl(result.data.avatarAssetId);
        if (active) setAvatarUrl(url);
      }
      setLoading(false);
    });
    return () => { active = false; };
  }, [directory, profileService, userId]);

  const handleMessage = useCallback(async (): Promise<void> => {
    if (!user || !profile || messaging) return;
    setMessaging(true);
    setMessageError(null);
    const result = await chat.startConversation(user.id, profile.id);
    setMessaging(false);
    if (!result.data) { setMessageError(result.error ?? 'A conversation could not be started.'); return; }
    navigate(`${ROUTES.chatConversation.replace(':conversationId', result.data.id)}`);
  }, [chat, messaging, navigate, profile, user]);

  if (loading) return <Spinner label="Loading profile…" />;

  if (!profile) {
    return (
      <EmptyState
        icon="👤"
        title="Profile not found"
        description={error ?? 'This profile could not be loaded.'}
      />
    );
  }

  const isSelf = user?.id === profile.id;
  const roleLabel = profile.roleLabel ?? profile.roleKey;

  return (
    <div className="sc-profile-detail">
      <Link to={ROUTES.connect} className="sc-chat-back">← Back to Connect</Link>
      <Card padding="lg" className="sc-profile-detail-card">
        <div className="sc-profile-detail-hero">
          {avatarUrl ? (
            <img className="sc-profile-detail-avatar" src={avatarUrl} alt="" />
          ) : (
            <div className="sc-profile-detail-avatar sc-profile-detail-avatar-fallback" aria-hidden="true">
              {profile.displayName.slice(0, 1).toUpperCase()}
            </div>
          )}
          <div className="sc-profile-detail-identity">
            <h2 className="sc-profile-detail-name">{profile.displayName}</h2>
            {profile.givenName && profile.familyName && (
              <p className="sc-profile-detail-name-detail">
                {profile.givenName} {profile.familyName}
              </p>
            )}
            <p className="sc-profile-detail-handle">@{profile.handle}</p>
            <div className="sc-profile-detail-badges">
              {roleLabel && <span className="sc-badge sc-badge-info">{roleLabel}</span>}
              {profile.designation && <span className="sc-badge sc-badge-open">{profile.designation}</span>}
            </div>
          </div>
        </div>

        {profile.headline && <p className="sc-profile-detail-headline">{profile.headline}</p>}
        {profile.bio && <p className="sc-profile-detail-bio">{profile.bio}</p>}

        {(profile.graduationYear || profile.departmentName || profile.programName) && (
          <div className="sc-profile-detail-facts">
            {profile.programName && (
              <div>🎓 <span>Program</span><strong>{profile.programName}</strong></div>
            )}
            {profile.departmentName && (
              <div>🏛️ <span>Department</span><strong>{profile.departmentName}</strong></div>
            )}
            {profile.graduationYear && (
              <div>📅 <span>Graduation</span><strong>{profile.graduationYear}</strong></div>
            )}
          </div>
        )}

        {!isSelf && (
          <div className="sc-profile-detail-actions">
            <Button onClick={() => void handleMessage()} disabled={messaging}>
              {messaging ? 'Starting…' : 'Message'}
            </Button>
            {messageError && <p className="sc-chat-error" role="alert">{messageError}</p>}
          </div>
        )}
      </Card>
    </div>
  );
}