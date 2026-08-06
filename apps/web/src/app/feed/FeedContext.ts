import { createContext, useContext } from 'react';
import type { FeedComment, FeedPost, FeedVisibility } from '@supercampus/supabase';

export interface CommentLoadState {
  loading: boolean;
  loaded: boolean;
  error: string | null;
}

export interface FeedContextValue {
  posts: FeedPost[];
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  commentsByPost: Readonly<Record<string, readonly FeedComment[]>>;
  commentStates: Readonly<Record<string, CommentLoadState | undefined>>;
  pendingLikePostIds: ReadonlySet<string>;
  pendingCommentIds: ReadonlySet<string>;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  loadComments: (postId: string, force?: boolean) => Promise<boolean>;
  createPost: (text: string, visibility?: FeedVisibility) => Promise<boolean>;
  updatePost: (postId: string, text: string, visibility?: FeedVisibility) => Promise<boolean>;
  deletePost: (postId: string) => Promise<boolean>;
  toggleLike: (postId: string) => Promise<boolean>;
  createComment: (postId: string, text: string, parentId?: string | null) => Promise<boolean>;
  updateComment: (postId: string, commentId: string, text: string) => Promise<boolean>;
  deleteComment: (postId: string, commentId: string) => Promise<boolean>;
}

export const FeedContext = createContext<FeedContextValue | null>(null);

export function useFeed(): FeedContextValue {
  const context = useContext(FeedContext);
  if (!context) throw new Error('useFeed must be used within FeedProvider.');
  return context;
}
