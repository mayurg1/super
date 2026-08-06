import { Card } from '@supercampus/shared';
import { useAuthorization } from '@supercampus/supabase';
import { PostComposer } from './PostComposer';
import { useFeed } from './FeedContext';

export function CreatePostCard(): React.ReactElement {
  const { createPost } = useFeed();
  const { hasPermission } = useAuthorization();
  const canCreate = hasPermission('posts.create');
  return <Card padding="md" className="sc-feed-create"><PostComposer onSubmit={createPost} disabled={!canCreate} />{!canCreate ? <p className="sc-feed-muted">Posting is not available for your current role.</p> : null}</Card>;
}
