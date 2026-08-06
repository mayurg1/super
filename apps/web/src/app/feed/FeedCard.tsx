import { memo, useState } from 'react';
import { Button, Card } from '@supercampus/shared';
import { useAuth } from '@supercampus/supabase';
import type { FeedPost } from '@supercampus/supabase';
import { useFeed } from './FeedContext';
import { CommentThread } from './CommentThread';
import { formatRelativeTimestamp } from './time';

function FeedCardComponent({ post }: { post: FeedPost }): React.ReactElement {
  const { user } = useAuth(); const { toggleLike, updatePost, deletePost, pendingLikePostIds } = useFeed();
  const [editing, setEditing] = useState(false); const [text, setText] = useState(post.text); const [working, setWorking] = useState(false);
  const ownsPost = user?.id === post.authorId; const likePending = pendingLikePostIds.has(post.id);
  const save = async (): Promise<void> => { setWorking(true); const saved = await updatePost(post.id, text, post.visibility); setWorking(false); if (saved) setEditing(false); };
  const remove = async (): Promise<void> => { if (!window.confirm('Delete this post?')) return; setWorking(true); await deletePost(post.id); setWorking(false); };
  return <Card padding="md" className="sc-feed-card"><article aria-label={`Post by ${post.author.displayName}`}><header className="sc-feed-card-header"><div className="sc-feed-avatar" aria-hidden="true">{post.author.displayName.slice(0, 1).toUpperCase()}</div><div><strong>{post.author.displayName}</strong><p>@{post.author.handle} · <time dateTime={post.createdAt}>{formatRelativeTimestamp(post.createdAt)}</time>{post.editedAt ? ' · Edited' : ''}</p></div>{ownsPost ? <div className="sc-feed-post-actions"><Button type="button" variant="ghost" size="sm" onClick={() => setEditing((value) => !value)} disabled={working}>{editing ? 'Cancel' : 'Edit'}</Button><Button type="button" variant="ghost" size="sm" onClick={() => void remove()} disabled={working}>Delete</Button></div> : null}</header>{editing ? <div className="sc-feed-edit"><label className="sc-sr-only" htmlFor={`edit-${post.id}`}>Edit post</label><textarea id={`edit-${post.id}`} className="sc-post-textarea" value={text} onChange={(event) => setText(event.target.value)} maxLength={2_000} /><Button type="button" size="sm" onClick={() => void save()} disabled={working || !text.trim()}>{working ? 'Saving…' : 'Save'}</Button></div> : <p className="sc-feed-body">{post.text}</p>}{post.media.length ? <div className="sc-feed-media-placeholder">Media attachments will be available when uploads are enabled.</div> : null}<footer className="sc-feed-card-footer"><Button type="button" variant={post.likedByMe ? 'secondary' : 'ghost'} size="sm" onClick={() => void toggleLike(post.id)} aria-pressed={post.likedByMe} disabled={likePending}>{post.likedByMe ? '♥ Liked' : '♡ Like'} <span aria-label={`${post.likeCount} likes`}>{post.likeCount}</span></Button><span>{post.commentCount} comments</span></footer><CommentThread postId={post.id} /></article></Card>;
}

export const FeedCard = memo(FeedCardComponent);
