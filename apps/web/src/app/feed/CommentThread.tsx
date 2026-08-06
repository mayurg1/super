import { useMemo, useState } from 'react';
import { Button } from '@supercampus/shared';
import { useAuth } from '@supercampus/supabase';
import type { FeedComment } from '@supercampus/supabase';
import { useFeed } from './FeedContext';
import { CommentComposer } from './CommentComposer';
import { formatRelativeTimestamp } from './time';

const EMPTY_COMMENTS: readonly FeedComment[] = [];

function CommentItem({ comment, replies, postId }: { comment: FeedComment; replies: readonly FeedComment[]; postId: string }): React.ReactElement {
  const { user } = useAuth(); const { updateComment, deleteComment, pendingCommentIds, createComment } = useFeed();
  const [editing, setEditing] = useState(false); const [replying, setReplying] = useState(false); const [text, setText] = useState(comment.text);
  const pending = pendingCommentIds.has(comment.id); const owns = user?.id === comment.authorId;
  const save = async (): Promise<void> => { if (await updateComment(postId, comment.id, text)) setEditing(false); };
  return <li className="sc-comment"><div className="sc-comment-avatar" aria-hidden="true">{comment.author.displayName.slice(0, 1).toUpperCase()}</div><div className="sc-comment-content"><div className="sc-comment-bubble"><strong>{comment.author.displayName}</strong>{editing ? <><label className="sc-sr-only" htmlFor={`comment-edit-${comment.id}`}>Edit comment</label><input id={`comment-edit-${comment.id}`} value={text} onChange={(event) => setText(event.target.value)} maxLength={1_000} disabled={pending} /><Button type="button" size="sm" onClick={() => void save()} disabled={pending || !text.trim()}>Save</Button></> : <p>{comment.text}</p>}</div><div className="sc-comment-meta"><span>{formatRelativeTimestamp(comment.createdAt)}{comment.edited ? ' · Edited' : ''}</span><Button type="button" variant="ghost" size="sm" onClick={() => setReplying((open) => !open)} disabled={pending}>Reply</Button>{owns ? <><Button type="button" variant="ghost" size="sm" onClick={() => setEditing((open) => !open)} disabled={pending}>{editing ? 'Cancel' : 'Edit'}</Button><Button type="button" variant="ghost" size="sm" onClick={() => void deleteComment(postId, comment.id)} disabled={pending}>Delete</Button></> : null}</div>{replying ? <CommentComposer compact placeholder={`Reply to ${comment.author.displayName}…`} onSubmit={async (body) => { const saved = await createComment(postId, body, comment.id); if (saved) setReplying(false); return saved; }} /> : null}{replies.length ? <ul className="sc-comment-replies">{replies.map((reply) => <CommentItem key={reply.id} comment={reply} replies={[]} postId={postId} />)}</ul> : null}</div></li>;
}

export function CommentThread({ postId }: { postId: string }): React.ReactElement {
  const { commentsByPost, commentStates, loadComments, createComment } = useFeed();
  const state = commentStates[postId]; const comments = commentsByPost[postId] ?? EMPTY_COMMENTS;
  const [expanded, setExpanded] = useState(false);
  const { roots, replies } = useMemo(() => { const known = new Set(comments.map((comment) => comment.id)); const children = new Map<string, FeedComment[]>(); const roots: FeedComment[] = []; comments.forEach((comment) => { if (comment.parentId && known.has(comment.parentId)) { const current = children.get(comment.parentId) ?? []; current.push(comment); children.set(comment.parentId, current); } else roots.push(comment); }); return { roots, replies: children }; }, [comments]);
  const toggle = (): void => { const next = !expanded; setExpanded(next); if (next) void loadComments(postId); };
  return <section className="sc-comments" aria-label="Comments"><Button type="button" variant="ghost" size="sm" onClick={toggle} aria-expanded={expanded}>{expanded ? 'Hide comments' : `View comments (${comments.length || '…'})`}</Button>{expanded ? <div className="sc-comments-panel">{state?.loading ? <div className="sc-comment-skeleton" aria-label="Loading comments" /> : null}{state?.error ? <div className="sc-comment-error" role="alert">{state.error}<Button type="button" variant="ghost" size="sm" onClick={() => void loadComments(postId, true)}>Retry</Button></div> : null}{state?.loaded && comments.length === 0 ? <p className="sc-feed-muted">No comments yet. Start the conversation.</p> : null}{roots.length ? <ul className="sc-comment-list">{roots.map((comment) => <CommentItem key={comment.id} comment={comment} replies={replies.get(comment.id) ?? []} postId={postId} />)}</ul> : null}<CommentComposer onSubmit={(text) => createComment(postId, text)} /></div> : null}</section>;
}
