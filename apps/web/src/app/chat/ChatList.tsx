import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, EmptyState, Spinner } from '@supercampus/shared';
import { ROUTES } from '@supercampus/core';
import { createChatService, useAuth, useSupabase, type ChatConversation } from '@supercampus/supabase';

const POLL_MS = 5000;

function formatTime(iso: string | null): string {
  if (!iso) return '';
  const date = new Date(iso);
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  if (sameDay) return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  return date.toLocaleDateString();
}

export function ChatList(): React.ReactElement {
  const client = useSupabase();
  const { user } = useAuth();
  const service = useMemo(() => createChatService(client), [client]);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (): Promise<void> => {
    if (!user) return;
    const result = await service.listConversations(user.id);
    if (!result.data) setError(result.error ?? 'Unable to load your conversations.');
    else { setConversations(result.data); setError(null); }
    setLoading(false);
  }, [service, user]);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    void refresh();
    const timer = window.setInterval(() => void refresh(), POLL_MS);
    return () => window.clearInterval(timer);
  }, [refresh, user]);

  if (loading) return <Spinner label="Loading conversations…" />;

  if (conversations.length === 0) {
    return (
      <EmptyState
        icon="💬"
        title="No conversations yet"
        description="Open a profile from Connect and press Message to start a conversation."
      />
    );
  }

  return (
    <div className="sc-chat-list">
      {conversations.map((conversation) => (
        <Link
          key={conversation.id}
          to={`${ROUTES.chatConversation.replace(':conversationId', conversation.id)}`}
          className="sc-chat-list-item"
        >
          <Card className="sc-chat-list-card">
            <div className="sc-chat-list-avatar" aria-hidden="true">
              {(conversation.partnerName ?? '?').slice(0, 1).toUpperCase()}
            </div>
            <div className="sc-chat-list-body">
              <div className="sc-chat-list-top">
                <strong>{conversation.partnerName ?? conversation.title ?? 'Conversation'}</strong>
                <span className="sc-chat-list-time">{formatTime(conversation.lastMessageAt)}</span>
              </div>
              {conversation.lastMessageAt && (
                <span className="sc-chat-list-preview">Last message {formatTime(conversation.lastMessageAt)}</span>
              )}
            </div>
          </Card>
        </Link>
      ))}
      {error && <p className="sc-chat-error" role="alert">{error}</p>}
    </div>
  );
}