import { useState } from 'react';
import { Button } from '@supercampus/shared';
import type { FeedVisibility } from '@supercampus/supabase';

const MAX_POST_LENGTH = 2_000;

export function PostComposer({ onSubmit, disabled = false }: { onSubmit: (text: string, visibility: FeedVisibility) => Promise<boolean>; disabled?: boolean }): React.ReactElement {
  const [text, setText] = useState('');
  const [visibility, setVisibility] = useState<FeedVisibility>('campus');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const valid = text.trim().length > 0 && text.length <= MAX_POST_LENGTH;
  async function publish(): Promise<void> {
    if (!valid || disabled) return;
    setSubmitting(true); setError(null);
    const saved = await onSubmit(text, visibility);
    if (saved) setText(''); else setError('Your post could not be published. Please try again.');
    setSubmitting(false);
  }
  return <form className="sc-post-composer" onSubmit={(event) => { event.preventDefault(); void publish(); }}><label className="sc-sr-only" htmlFor="post-body">Share an update</label><textarea id="post-body" className="sc-post-textarea" value={text} onChange={(event) => setText(event.target.value)} onKeyDown={(event) => { if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') { event.preventDefault(); void publish(); } }} maxLength={MAX_POST_LENGTH} placeholder="Share an update with your campus…" disabled={disabled || submitting} /><div className="sc-post-composer-footer"><label className="sc-post-visibility" htmlFor="post-visibility">Audience<select id="post-visibility" value={visibility} onChange={(event) => setVisibility(event.target.value as FeedVisibility)} disabled={disabled || submitting}><option value="campus">Campus</option><option value="public">Public</option><option value="private">Only me</option></select></label><span className="sc-post-counter" aria-live="polite">{text.length}/{MAX_POST_LENGTH}</span><Button type="submit" size="sm" disabled={!valid || disabled || submitting}>{submitting ? 'Publishing…' : 'Post'}</Button></div><p className="sc-feed-muted">Press Ctrl/⌘ + Enter to publish.</p>{error ? <p className="sc-feed-error" role="alert">{error}</p> : null}</form>;
}
