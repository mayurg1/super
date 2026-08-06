import type { SupercampusSupabaseClient } from './client.js';
import type { Tables } from './database.types.js';

type PostRow = Tables<'posts'>;
type ProfileRow = Tables<'profiles'>;
type PostMediaRow = Tables<'post_media'>;
type PostLikeRow = Tables<'post_likes'>;
type PostCommentRow = Tables<'post_comments'>;

export type FeedVisibility = 'private' | 'campus' | 'public';
export type FeedMediaKind = 'image' | 'video';

export interface FeedAuthor {
  id: string;
  displayName: string;
  handle: string;
  avatarAssetId: string | null;
}

export interface FeedMedia {
  id: string;
  assetId: string;
  position: number;
  altText: string;
  kind: FeedMediaKind;
}

export interface FeedPost {
  id: string;
  authorId: string;
  author: FeedAuthor;
  campusId: string | null;
  text: string;
  createdAt: string;
  updatedAt: string;
  editedAt: string | null;
  media: FeedMedia[];
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
  visibility: FeedVisibility;
}

export interface FeedComment {
  id: string;
  postId: string;
  parentId: string | null;
  authorId: string;
  author: FeedAuthor;
  text: string;
  createdAt: string;
  updatedAt: string;
  edited: boolean;
}

export interface FeedCursor {
  publishedAt: string;
}

export interface FeedQuery {
  campusId?: string | null;
  cursor?: FeedCursor | null;
  limit?: number;
  viewerId?: string | null;
}

export interface FeedPage {
  posts: FeedPost[];
  nextCursor: FeedCursor | null;
}

export interface PostMediaInput {
  assetId: string;
  altText?: string;
  kind?: FeedMediaKind;
}

export interface CreatePostInput {
  authorId: string;
  campusId?: string | null;
  text: string;
  visibility?: FeedVisibility;
  media?: readonly PostMediaInput[];
}

export interface UpdatePostInput {
  text: string;
  visibility?: FeedVisibility;
}

export interface CreateCommentInput {
  postId: string;
  authorId: string;
  text: string;
  parentId?: string | null;
}

export interface UpdateCommentInput {
  text: string;
}

export type FeedResult<T> = { data: T; error: null } | { data: null; error: string };

const DEFAULT_PAGE_SIZE = 20;

function feedError(): string {
  return 'Unable to load the campus feed. Please try again.';
}

function mutationError(): string {
  return 'Unable to save your post. Please try again.';
}

function commentError(): string {
  return 'Unable to save your comment. Please try again.';
}

function toVisibility(value: string): FeedVisibility {
  return value === 'private' || value === 'public' ? value : 'campus';
}

function toAuthor(profile: Pick<ProfileRow, 'id' | 'display_name' | 'handle' | 'avatar_asset_id'> | undefined, authorId: string): FeedAuthor {
  return {
    id: authorId,
    displayName: profile?.display_name || 'Campus member',
    handle: profile?.handle || 'member',
    avatarAssetId: profile?.avatar_asset_id ?? null,
  };
}

function groupByPostId(rows: readonly { post_id: string }[]): Map<string, number> {
  const counts = new Map<string, number>();
  rows.forEach((row) => counts.set(row.post_id, (counts.get(row.post_id) ?? 0) + 1));
  return counts;
}

function normalizeMedia(row: PostMediaRow): FeedMedia {
  return {
    id: row.id,
    assetId: row.media_asset_id,
    position: row.position,
    altText: row.alt_text,
    // Media assets will supply MIME information when uploads are connected.
    kind: 'image',
  };
}

function normalizeComment(
  row: PostCommentRow,
  profiles: ReadonlyMap<string, Pick<ProfileRow, 'id' | 'display_name' | 'handle' | 'avatar_asset_id'>>,
): FeedComment {
  return {
    id: row.id,
    postId: row.post_id,
    parentId: row.parent_id,
    authorId: row.author_id,
    author: toAuthor(profiles.get(row.author_id), row.author_id),
    text: row.body,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    edited: row.updated_at !== row.created_at,
  };
}

export function createFeedService(client: SupercampusSupabaseClient) {
  async function loadPosts(query: FeedQuery & { postId?: string }): Promise<FeedResult<FeedPage>> {
    const limit = Math.max(1, Math.min(query.limit ?? DEFAULT_PAGE_SIZE, 50));
    let request = client
      .from('posts')
      .select('*')
      .eq('status', 'published')
      .is('deleted_at', null)
      .order('published_at', { ascending: false })
      .order('id', { ascending: false })
      .limit(query.postId ? 1 : limit + 1);

    if (query.postId) request = request.eq('id', query.postId);
    if (query.campusId) request = request.eq('campus_id', query.campusId);
    if (query.cursor) request = request.lt('published_at', query.cursor.publishedAt);

    const { data: postRows, error: postsError } = await request;
    if (postsError || !postRows) return { data: null, error: feedError() };

    const visiblePosts = query.postId ? postRows : postRows.slice(0, limit);
    if (visiblePosts.length === 0) return { data: { posts: [], nextCursor: null }, error: null };

    const postIds = visiblePosts.map((post) => post.id);
    const authorIds = [...new Set(visiblePosts.map((post) => post.author_id))];
    const requests = await Promise.all([
      client.from('profiles').select('id, display_name, handle, avatar_asset_id').in('id', authorIds),
      client.from('post_media').select('*').in('post_id', postIds).order('position', { ascending: true }),
      client.from('post_likes').select('post_id').in('post_id', postIds),
      client.from('post_comments').select('post_id').in('post_id', postIds).eq('status', 'published').is('deleted_at', null),
      query.viewerId
        ? client.from('post_likes').select('post_id').eq('user_id', query.viewerId).in('post_id', postIds)
        : Promise.resolve({ data: [] as Pick<PostLikeRow, 'post_id'>[], error: null }),
    ]);

    const [profiles, media, likes, comments, viewerLikes] = requests;
    if (profiles.error || media.error || likes.error || comments.error || viewerLikes.error) {
      return { data: null, error: feedError() };
    }

    const profileMap = new Map((profiles.data ?? []).map((profile) => [profile.id, profile]));
    const mediaMap = new Map<string, FeedMedia[]>();
    (media.data ?? []).forEach((item) => {
      const current = mediaMap.get(item.post_id) ?? [];
      current.push(normalizeMedia(item));
      mediaMap.set(item.post_id, current);
    });
    const likeCounts = groupByPostId(likes.data ?? []);
    const commentCounts = groupByPostId(comments.data ?? [] as PostCommentRow[]);
    const likedPostIds = new Set((viewerLikes.data ?? []).map((like) => like.post_id));

    const posts = visiblePosts.map((post: PostRow): FeedPost => ({
      id: post.id,
      authorId: post.author_id,
      author: toAuthor(profileMap.get(post.author_id), post.author_id),
      campusId: post.campus_id,
      text: post.body,
      createdAt: post.published_at,
      updatedAt: post.updated_at,
      editedAt: post.edited_at,
      media: mediaMap.get(post.id) ?? [],
      likeCount: likeCounts.get(post.id) ?? 0,
      commentCount: commentCounts.get(post.id) ?? 0,
      likedByMe: likedPostIds.has(post.id),
      visibility: toVisibility(post.visibility),
    }));

    const next = !query.postId && postRows.length > limit ? visiblePosts.at(-1) : undefined;
    return { data: { posts, nextCursor: next ? { publishedAt: next.published_at } : null }, error: null };
  }

  async function loadComments(postId: string): Promise<FeedResult<FeedComment[]>> {
    const { data: commentRows, error: commentsError } = await client
      .from('post_comments')
      .select('*')
      .eq('post_id', postId)
      .eq('status', 'published')
      .is('deleted_at', null)
      .order('created_at', { ascending: true })
      .order('id', { ascending: true });
    if (commentsError || !commentRows) return { data: null, error: feedError() };
    if (commentRows.length === 0) return { data: [], error: null };
    const authorIds = [...new Set(commentRows.map((comment) => comment.author_id))];
    const { data: profiles, error: profilesError } = await client
      .from('profiles')
      .select('id, display_name, handle, avatar_asset_id')
      .in('id', authorIds);
    if (profilesError) return { data: null, error: feedError() };
    const profileMap = new Map((profiles ?? []).map((profile) => [profile.id, profile]));
    return { data: commentRows.map((comment) => normalizeComment(comment, profileMap)), error: null };
  }

  return {
    getFeed(query: FeedQuery = {}): Promise<FeedResult<FeedPage>> {
      return loadPosts(query);
    },
    async getPost(id: string, viewerId?: string | null): Promise<FeedResult<FeedPost | null>> {
      const result = await loadPosts({ postId: id, viewerId });
      if (!result.data) return { data: null, error: result.error ?? feedError() };
      return { data: result.data.posts[0] ?? null, error: null };
    },
    async createPost(input: CreatePostInput): Promise<FeedResult<FeedPost>> {
      const body = input.text.trim();
      if (!body) return { data: null, error: 'Write something before publishing your post.' };
      const { data: created, error } = await client
        .from('posts')
        .insert({
          author_id: input.authorId,
          campus_id: input.campusId ?? null,
          body,
          visibility: input.visibility ?? 'campus',
          status: 'published',
        })
        .select('id')
        .single();
      if (error || !created) return { data: null, error: mutationError() };

      if (input.media?.length) {
        const { error: mediaError } = await client.from('post_media').insert(
          input.media.map((media, position) => ({
            post_id: created.id,
            media_asset_id: media.assetId,
            position,
            alt_text: media.altText ?? '',
          })),
        );
        if (mediaError) return { data: null, error: mutationError() };
      }

      const result = await loadPosts({ postId: created.id, viewerId: input.authorId });
      if (!result.data || !result.data.posts[0]) return { data: null, error: result.error ?? mutationError() };
      return { data: result.data.posts[0], error: null };
    },
    async updatePost(id: string, input: UpdatePostInput, viewerId?: string | null): Promise<FeedResult<FeedPost>> {
      const body = input.text.trim();
      if (!body) return { data: null, error: 'A post cannot be empty.' };
      const { error } = await client
        .from('posts')
        .update({ body, visibility: input.visibility, edited_at: new Date().toISOString() })
        .eq('id', id);
      if (error) return { data: null, error: mutationError() };
      const result = await loadPosts({ postId: id, viewerId });
      if (!result.data || !result.data.posts[0]) return { data: null, error: result.error ?? mutationError() };
      return { data: result.data.posts[0], error: null };
    },
    async deletePost(id: string): Promise<FeedResult<void>> {
      const { error } = await client
        .from('posts')
        .update({ status: 'removed', deleted_at: new Date().toISOString() })
        .eq('id', id);
      if (error) {
        const diagnosticError = error as typeof error & { status?: number };
        console.error('[feed] deletePost Supabase error object', error);
        console.error('[feed] deletePost Supabase error fields', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
          status: diagnosticError.status ?? null,
        });
      }
      return error ? { data: null, error: mutationError() } : { data: undefined, error: null };
    },
    async likePost(postId: string, userId: string): Promise<FeedResult<void>> {
      const { error } = await client.from('post_likes').upsert({ post_id: postId, user_id: userId }, { onConflict: 'post_id,user_id' });
      return error ? { data: null, error: mutationError() } : { data: undefined, error: null };
    },
    async unlikePost(postId: string, userId: string): Promise<FeedResult<void>> {
      const { error } = await client.from('post_likes').delete().eq('post_id', postId).eq('user_id', userId);
      return error ? { data: null, error: mutationError() } : { data: undefined, error: null };
    },
    getComments(postId: string): Promise<FeedResult<FeedComment[]>> {
      return loadComments(postId);
    },
    async createComment(input: CreateCommentInput): Promise<FeedResult<FeedComment>> {
      const body = input.text.trim();
      if (!body) return { data: null, error: 'Write something before posting your comment.' };
      const { data, error } = await client
        .from('post_comments')
        .insert({ post_id: input.postId, author_id: input.authorId, parent_id: input.parentId ?? null, body, status: 'published' })
        .select('*')
        .single();
      if (error || !data) return { data: null, error: commentError() };
      const { data: profiles, error: profilesError } = await client
        .from('profiles')
        .select('id, display_name, handle, avatar_asset_id')
        .eq('id', data.author_id);
      if (profilesError) return { data: null, error: commentError() };
      const profileMap = new Map((profiles ?? []).map((profile) => [profile.id, profile]));
      return { data: normalizeComment(data, profileMap), error: null };
    },
    async updateComment(id: string, input: UpdateCommentInput): Promise<FeedResult<FeedComment>> {
      const body = input.text.trim();
      if (!body) return { data: null, error: 'A comment cannot be empty.' };
      const { data, error } = await client.from('post_comments').update({ body }).eq('id', id).select('*').single();
      if (error || !data) return { data: null, error: commentError() };
      const { data: profiles, error: profilesError } = await client
        .from('profiles')
        .select('id, display_name, handle, avatar_asset_id')
        .eq('id', data.author_id);
      if (profilesError) return { data: null, error: commentError() };
      const profileMap = new Map((profiles ?? []).map((profile) => [profile.id, profile]));
      return { data: normalizeComment(data, profileMap), error: null };
    },
    async deleteComment(id: string): Promise<FeedResult<void>> {
      const { error } = await client
        .from('post_comments')
        .update({ status: 'removed', deleted_at: new Date().toISOString() })
        .eq('id', id);
      return error ? { data: null, error: commentError() } : { data: undefined, error: null };
    },
  };
}

export type FeedService = ReturnType<typeof createFeedService>;
