import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createFeedService, useAuth, useProfile, useSupabase, type FeedComment, type FeedPost, type FeedVisibility } from '@supercampus/supabase';
import { FeedContext, type CommentLoadState, type FeedContextValue } from './FeedContext';

const EMPTY_COMMENT_STATE: CommentLoadState = { loading: false, loaded: false, error: null };

function optimisticId(): string { return `optimistic-${crypto.randomUUID()}`; }
function setMember(current: ReadonlySet<string>, id: string, present: boolean): Set<string> { const next = new Set(current); if (present) next.add(id); else next.delete(id); return next; }

export function FeedProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const client = useSupabase(); const { user } = useAuth(); const { profile } = useProfile();
  const service = useMemo(() => createFeedService(client), [client]);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true); const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null); const [cursor, setCursor] = useState<{ publishedAt: string } | null>(null);
  const [commentsByPost, setCommentsByPost] = useState<Record<string, readonly FeedComment[]>>({});
  const [commentStates, setCommentStates] = useState<Record<string, CommentLoadState | undefined>>({});
  const [pendingLikePostIds, setPendingLikePostIds] = useState<ReadonlySet<string>>(new Set());
  const [pendingCommentIds, setPendingCommentIds] = useState<ReadonlySet<string>>(new Set());
  const initializedForUser = useRef<string | null>(null); const commentRequests = useRef(new Map<string, Promise<boolean>>());

  const refresh = useCallback(async () => {
    if (!user) { setPosts([]); setCursor(null); setCommentsByPost({}); setCommentStates({}); setLoading(false); return; }
    setLoading(true); setError(null);
    const result = await service.getFeed({ campusId: profile?.campus_id, viewerId: user.id });
    if (!result.data) { setError(result.error ?? 'Unable to load the campus feed.'); setPosts([]); setCursor(null); }
    else { setPosts(result.data.posts); setCursor(result.data.nextCursor); }
    setLoading(false);
  }, [profile?.campus_id, service, user]);

  useEffect(() => {
    if (!user) { initializedForUser.current = null; setPosts([]); setCursor(null); setLoading(false); return; }
    const key = `${user.id}:${profile?.campus_id ?? ''}`;
    if (initializedForUser.current !== key) { initializedForUser.current = key; void refresh(); }
  }, [profile?.campus_id, refresh, user]);

  const loadMore = useCallback(async () => {
    if (!user || !cursor || loadingMore) return;
    setLoadingMore(true); setError(null);
    const result = await service.getFeed({ campusId: profile?.campus_id, cursor, viewerId: user.id });
    if (!result.data) setError(result.error ?? 'Unable to load the campus feed.');
    else { setPosts((current) => [...current, ...result.data.posts.filter((post) => !current.some((item) => item.id === post.id))]); setCursor(result.data.nextCursor); }
    setLoadingMore(false);
  }, [cursor, loadingMore, profile?.campus_id, service, user]);

  const loadComments = useCallback((postId: string, force = false): Promise<boolean> => {
    const state = commentStates[postId] ?? EMPTY_COMMENT_STATE;
    if (!force && state.loaded) return Promise.resolve(true);
    const active = commentRequests.current.get(postId); if (active) return active;
    const request = (async () => {
      setCommentStates((current) => ({ ...current, [postId]: { loading: true, loaded: state.loaded, error: null } }));
      const result = await service.getComments(postId);
      if (!result.data) { setCommentStates((current) => ({ ...current, [postId]: { loading: false, loaded: false, error: result.error ?? 'Unable to load comments.' } })); return false; }
      setCommentsByPost((current) => ({ ...current, [postId]: result.data }));
      setCommentStates((current) => ({ ...current, [postId]: { loading: false, loaded: true, error: null } }));
      return true;
    })().finally(() => commentRequests.current.delete(postId));
    commentRequests.current.set(postId, request); return request;
  }, [commentStates, service]);

  const createPost = useCallback(async (text: string, visibility: FeedVisibility = 'campus'): Promise<boolean> => {
    if (!user || !profile || !text.trim()) return false;
    const now = new Date().toISOString(); const temporary: FeedPost = { id: optimisticId(), authorId: user.id, author: { id: profile.id, displayName: profile.display_name, handle: profile.handle, avatarAssetId: profile.avatar_asset_id }, campusId: profile.campus_id, text: text.trim(), createdAt: now, updatedAt: now, editedAt: null, media: [], likeCount: 0, commentCount: 0, likedByMe: false, visibility };
    setError(null); setPosts((current) => [temporary, ...current]);
    const result = await service.createPost({ authorId: user.id, campusId: profile.campus_id, text: temporary.text, visibility });
    if (!result.data) { setPosts((current) => current.filter((post) => post.id !== temporary.id)); setError(result.error ?? 'Your post could not be published.'); return false; }
    setPosts((current) => current.map((post) => post.id === temporary.id ? result.data : post)); return true;
  }, [profile, service, user]);

  const updatePost = useCallback(async (postId: string, text: string, visibility?: FeedVisibility): Promise<boolean> => {
    if (!user) return false; const original = posts.find((post) => post.id === postId); if (!original || !text.trim()) return false;
    const optimistic = { ...original, text: text.trim(), visibility: visibility ?? original.visibility, editedAt: new Date().toISOString() };
    setError(null); setPosts((current) => current.map((post) => post.id === postId ? optimistic : post));
    const result = await service.updatePost(postId, { text: optimistic.text, visibility }, user.id);
    if (!result.data) { setPosts((current) => current.map((post) => post.id === postId ? original : post)); setError(result.error ?? 'Your post could not be saved.'); return false; }
    setPosts((current) => current.map((post) => post.id === postId ? result.data : post)); return true;
  }, [posts, service, user]);

  const deletePost = useCallback(async (postId: string): Promise<boolean> => {
    const original = posts.find((post) => post.id === postId); if (!original) return false;
    setError(null); setPosts((current) => current.filter((post) => post.id !== postId));
    const result = await service.deletePost(postId);
    if (!result.data && result.error) { setPosts((current) => [original, ...current]); setError(result.error); return false; }
    return true;
  }, [posts, service]);

  const toggleLike = useCallback(async (postId: string): Promise<boolean> => {
    if (!user || pendingLikePostIds.has(postId)) return false;
    const original = posts.find((post) => post.id === postId); if (!original) return false;
    const optimistic = { ...original, likedByMe: !original.likedByMe, likeCount: Math.max(0, original.likeCount + (original.likedByMe ? -1 : 1)) };
    setPendingLikePostIds((current) => setMember(current, postId, true)); setError(null); setPosts((current) => current.map((post) => post.id === postId ? optimistic : post));
    const result = original.likedByMe ? await service.unlikePost(postId, user.id) : await service.likePost(postId, user.id);
    setPendingLikePostIds((current) => setMember(current, postId, false));
    if (!result.data && result.error) { setPosts((current) => current.map((post) => post.id === postId ? original : post)); setError(result.error); return false; }
    return true;
  }, [pendingLikePostIds, posts, service, user]);

  const changeCommentCount = useCallback((postId: string, delta: number) => setPosts((current) => current.map((post) => post.id === postId ? { ...post, commentCount: Math.max(0, post.commentCount + delta) } : post)), []);

  const createComment = useCallback(async (postId: string, text: string, parentId: string | null = null): Promise<boolean> => {
    if (!user || !profile || !text.trim()) return false;
    const now = new Date().toISOString(); const temporary: FeedComment = { id: optimisticId(), postId, parentId, authorId: user.id, author: { id: profile.id, displayName: profile.display_name, handle: profile.handle, avatarAssetId: profile.avatar_asset_id }, text: text.trim(), createdAt: now, updatedAt: now, edited: false };
    setPendingCommentIds((current) => setMember(current, temporary.id, true)); setCommentsByPost((current) => ({ ...current, [postId]: [...(current[postId] ?? []), temporary] })); changeCommentCount(postId, 1);
    const result = await service.createComment({ postId, authorId: user.id, text: temporary.text, parentId });
    setPendingCommentIds((current) => setMember(current, temporary.id, false));
    if (!result.data) { setCommentsByPost((current) => ({ ...current, [postId]: (current[postId] ?? []).filter((comment) => comment.id !== temporary.id) })); changeCommentCount(postId, -1); setError(result.error ?? 'Your comment could not be posted.'); return false; }
    setCommentsByPost((current) => ({ ...current, [postId]: (current[postId] ?? []).map((comment) => comment.id === temporary.id ? result.data : comment) })); return true;
  }, [changeCommentCount, profile, service, user]);

  const updateComment = useCallback(async (postId: string, commentId: string, text: string): Promise<boolean> => {
    const original = (commentsByPost[postId] ?? []).find((comment) => comment.id === commentId); if (!original || !text.trim() || pendingCommentIds.has(commentId)) return false;
    const optimistic = { ...original, text: text.trim(), updatedAt: new Date().toISOString(), edited: true };
    setPendingCommentIds((current) => setMember(current, commentId, true)); setCommentsByPost((current) => ({ ...current, [postId]: (current[postId] ?? []).map((comment) => comment.id === commentId ? optimistic : comment) }));
    const result = await service.updateComment(commentId, { text: optimistic.text });
    setPendingCommentIds((current) => setMember(current, commentId, false));
    if (!result.data) { setCommentsByPost((current) => ({ ...current, [postId]: (current[postId] ?? []).map((comment) => comment.id === commentId ? original : comment) })); setError(result.error ?? 'Your comment could not be saved.'); return false; }
    setCommentsByPost((current) => ({ ...current, [postId]: (current[postId] ?? []).map((comment) => comment.id === commentId ? result.data : comment) })); return true;
  }, [commentsByPost, pendingCommentIds, service]);

  const deleteComment = useCallback(async (postId: string, commentId: string): Promise<boolean> => {
    const original = (commentsByPost[postId] ?? []).find((comment) => comment.id === commentId); if (!original || pendingCommentIds.has(commentId)) return false;
    setPendingCommentIds((current) => setMember(current, commentId, true)); setCommentsByPost((current) => ({ ...current, [postId]: (current[postId] ?? []).filter((comment) => comment.id !== commentId) })); changeCommentCount(postId, -1);
    const result = await service.deleteComment(commentId);
    setPendingCommentIds((current) => setMember(current, commentId, false));
    if (!result.data && result.error) { setCommentsByPost((current) => ({ ...current, [postId]: [...(current[postId] ?? []), original].sort((left, right) => left.createdAt.localeCompare(right.createdAt)) })); changeCommentCount(postId, 1); setError(result.error); return false; }
    return true;
  }, [changeCommentCount, commentsByPost, pendingCommentIds, service]);

  const value = useMemo<FeedContextValue>(() => ({ posts, loading, loadingMore, error, hasMore: cursor !== null, commentsByPost, commentStates, pendingLikePostIds, pendingCommentIds, refresh, loadMore, loadComments, createPost, updatePost, deletePost, toggleLike, createComment, updateComment, deleteComment }), [commentsByPost, commentStates, createComment, createPost, cursor, deleteComment, deletePost, error, loadComments, loadMore, loading, loadingMore, pendingCommentIds, pendingLikePostIds, posts, refresh, toggleLike, updateComment, updatePost]);
  return <FeedContext.Provider value={value}>{children}</FeedContext.Provider>;
}
