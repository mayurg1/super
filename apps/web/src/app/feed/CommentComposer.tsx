import { useState } from 'react';
import { Button } from '@supercampus/shared';

export function CommentComposer({ onSubmit, placeholder = 'Write a comment…', compact = false }: { onSubmit: (text: string) => Promise<boolean>; placeholder?: string; compact?: boolean }): React.ReactElement {
  const [text, setText] = useState(''); const [submitting, setSubmitting] = useState(false);
  const submit = async (): Promise<void> => { if (!text.trim() || submitting) return; setSubmitting(true); const saved = await onSubmit(text); if (saved) setText(''); setSubmitting(false); };
  return <div className={`sc-comment-composer${compact ? ' is-compact' : ''}`}><label className="sc-sr-only" htmlFor={compact ? 'reply-body' : 'comment-body'}>{placeholder}</label><input id={compact ? 'reply-body' : 'comment-body'} value={text} onChange={(event) => setText(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); void submit(); } }} placeholder={placeholder} maxLength={1_000} disabled={submitting} /><Button type="button" size="sm" onClick={() => void submit()} disabled={!text.trim() || submitting}>{submitting ? 'Sending…' : 'Send'}</Button></div>;
}
