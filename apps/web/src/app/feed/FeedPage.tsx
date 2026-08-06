import { FeedProvider } from './FeedProvider';
import { CreatePostCard } from './CreatePostCard';
import { FeedList } from './FeedList';

function FeedContent(): React.ReactElement {
  return <section className="sc-feed" aria-labelledby="feed-title"><header className="sc-feed-heading"><div><h1 id="feed-title">Campus feed</h1><p>Updates from your campus community.</p></div></header><CreatePostCard /><FeedList /></section>;
}

export function FeedPage(): React.ReactElement {
  return <FeedProvider><FeedContent /></FeedProvider>;
}
