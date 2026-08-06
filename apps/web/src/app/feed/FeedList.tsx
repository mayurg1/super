import { Button } from '@supercampus/shared';
import { useFeed } from './FeedContext';
import { EmptyFeed } from './EmptyFeed';
import { ErrorState } from './ErrorState';
import { FeedCard } from './FeedCard';
import { LoadingSkeleton } from './LoadingSkeleton';

export function FeedList(): React.ReactElement {
  const { posts, loading, loadingMore, error, hasMore, refresh, loadMore } = useFeed();
  if (loading) return <LoadingSkeleton />;
  if (error && posts.length === 0) return <ErrorState onRetry={refresh} />;
  if (posts.length === 0) return <EmptyFeed />;
  return <div className="sc-feed-list">{error ? <p className="sc-feed-error" role="alert">{error}</p> : null}{posts.map((post) => <FeedCard key={post.id} post={post} />)}{hasMore ? <Button type="button" variant="outline" onClick={() => void loadMore()} disabled={loadingMore}>{loadingMore ? 'Loading…' : 'Load more'}</Button> : null}</div>;
}
