import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, EmptyState, Spinner } from '@supercampus/shared';
import { ROUTES } from '@supercampus/core';
import { createChatService, useAuth, useSupabase, type ChatMessage, type ChatConversation } from '@supercampus/supabase';

const POLL_MS = 2000;

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export function ChatThread({ conversationId }: { conversationId: string }): React.ReactElement {
  const client = useSupabase();
  const { user } = useAuth();
  const service = useMemo(() => createChatService(client), [client]);
  const [conversation, setConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const refreshMessages = useCallback(async (): Promise<void> => {
    if (!user) return;
    const result = await service.getMessages(conversationId);
    if (!result.data) setError(result.error ?? 'Unable to load this conversation.');
    else { setMessages(result.data); setError(null); }
    setLoading(false);
  }, [conversationId, service, user]);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    void refreshMessages();
    const timer = window.setInterval(() => void refreshMessages(), POLL_MS);
    return () => window.clearInterval(timer);
  }, [conversationId, refreshMessages, user]);

  useEffect(() => {
    if (!user) return;
    let active = true;
    void service.listConversations(user.id).then((result) => {
      if (!active) return;
      const found = result.data?.find((item) => item.id === conversationId) ?? null;
      setConversation(found);
    });
    return () => { active = false; };
  }, [conversationId, service, user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [messages.length]);

  const send = useCallback(async (): Promise<void> => {
    if (!user || !draft.trim() || sending) return;
    setSending(true);
    setError(null);
    const result = await service.sendMessage(conversationId, user.id, draft);
    setSending(false);
    if (!result.data) { setError(result.error ?? 'Your message could not be sent.'); return; }
    setMessages((current) => [...current, result.data as ChatMessage]);
    setDraft('');
  }, [conversationId, draft, sending, service, user]);

  if (loading) return <Spinner label="Loading conversation…" />;

  return (
    <div className="sc-chat-thread">
      <div className="sc-chat-thread-head">
        <Link to={ROUTES.chat} className="sc-chat-back">← All conversations</Link>
        <h3 className="sc-chat-thread-title">
          {conversation?.partnerName ?? conversation?.title ?? 'Conversation'}
        </h3>
      </div>

      {messages.length === 0 ? (
        <EmptyState icon="💬" title="No messages yet" description="Say hello to start the conversation." />
      ) : (
        <div className="sc-chat-messages">
          {messages.map((message) => {
            const mine = message.senderId === user?.id;
            return (
              <div key={message.id} className={`sc-chat-message ${mine ? 'is-mine' : ''}`}>
                <div className="sc-chat-bubble">{message.body}</div>
                <span className="sc-chat-message-time">{formatTime(message.createdAt)}</span>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      )}

      {error && <p className="sc-chat-error" role="alert">{error}</p>}

      <form
        className="sc-chat-composer"
        onSubmit={(event) => { event.preventDefault(); void send(); }}
      >
        <input
          className="sc-input"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Type a message…"
          aria-label="Message"
          maxLength={2000}
        />
        <Button type="submit" variant="primary" disabled={sending || !draft.trim()}>
          {sending ? 'Sending…' : 'Send'}
        </Button>
      </form>
    </div>
  );
}