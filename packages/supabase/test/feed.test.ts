import { describe, expect, it } from 'vitest';
import { createMockClient } from './helpers/mockClient';
import { createFeedService } from '../src/feed';

type Client = Parameters<typeof createFeedService>[0];

const POST_ROW = {
  id: 'post-1',
  author_id: 'user-1',
  campus_id: 'campus-1',
  body: 'Hello world',
  visibility: 'campus',
  status: 'published',
  deleted_at: null,
  published_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  edited_at: null,
};

describe('createFeedService', () => {
  it('getFeed returns normalized posts with author + counts', async () => {
    const client = createMockClient({
      posts: () => ({ data: [POST_ROW], error: null }),
      profiles: () => ({
        data: [{ id: 'user-1', display_name: 'Ada', handle: 'ada', avatar_asset_id: null }],
        error: null,
      }),
      post_media: () => ({ data: [], error: null }),
      post_likes: (call) =>
        call === 1 ? { data: [{ post_id: 'post-1' }], error: null } : { data: [], error: null },
      post_comments: () => ({ data: [], error: null }),
    });
    const service = createFeedService(client as unknown as Client);

    const result = await service.getFeed({ campusId: 'campus-1', viewerId: 'user-1' });
    expect(result.error).toBeNull();
    expect(result.data?.posts).toHaveLength(1);
    const post = result.data?.posts[0];
    expect(post?.id).toBe('post-1');
    expect(post?.author.displayName).toBe('Ada');
    expect(post?.likeCount).toBe(1);
    expect(post?.likedByMe).toBe(false);
  });

  it('getFeed surfaces an error when posts fail to load', async () => {
    const client = createMockClient({
      posts: () => ({ data: null, error: { message: 'permission denied' } }),
    });
    const service = createFeedService(client as unknown as Client);

    const result = await service.getFeed({ campusId: 'campus-1' });
    expect(result.error).toContain('Unable to load');
    expect(result.data).toBeNull();
  });

  it('createPost trims text and rejects empty posts', async () => {
    const client = createMockClient({
      posts: () => ({ data: null, error: null }),
    });
    const service = createFeedService(client as unknown as Client);

    const result = await service.createPost({ authorId: 'user-1', text: '   ' });
    expect(result.error).toBe('Write something before publishing your post.');
  });
});