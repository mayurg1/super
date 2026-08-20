import type { SupercampusSupabaseClient } from './client.js';
import type { Tables } from './database.types.js';

type MessageRow = Tables<'messages'>;

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  messageType: string;
  createdAt: string;
}

export interface ChatConversation {
  id: string;
  title: string | null;
  lastMessageAt: string | null;
  createdAt: string;
  partnerId: string | null;
  partnerName: string | null;
  partnerAvatarAssetId: string | null;
}

export type ChatResult<T> = { data: T; error: null } | { data: null; error: string };

const CHAT_LOAD_ERROR = 'Unable to load your conversations. Please try again.';
const CHAT_SEND_ERROR = 'Your message could not be sent. Please try again.';
const CHAT_START_ERROR = 'A conversation could not be started. Please try again.';

function toMessage(row: MessageRow): ChatMessage {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    senderId: row.sender_id,
    body: row.body,
    messageType: row.message_type,
    createdAt: row.created_at,
  };
}

export function createChatService(client: SupercampusSupabaseClient) {
  async function loadPartner(
    conversationId: string,
    viewerId: string,
  ): Promise<{ id: string; name: string | null; avatarAssetId: string | null } | null> {
    const { data: peers } = await client
      .from('conversation_members')
      .select('user_id')
      .eq('conversation_id', conversationId)
      .is('left_at', null)
      .neq('user_id', viewerId);
    const peerId = peers?.[0]?.user_id;
    if (!peerId) return null;
    const { data: profile } = await client
      .from('profiles')
      .select('id, display_name, avatar_asset_id')
      .eq('id', peerId)
      .maybeSingle();
    return {
      id: peerId,
      name: profile?.display_name ?? null,
      avatarAssetId: profile?.avatar_asset_id ?? null,
    };
  }

  async function loadConversation(conversationId: string, viewerId: string): Promise<ChatResult<ChatConversation | null>> {
    const { data: row, error } = await client
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .maybeSingle();
    if (error) return { data: null, error: CHAT_LOAD_ERROR };
    if (!row) return { data: null, error: null };
    const partner = await loadPartner(row.id, viewerId);
    return {
      data: {
        id: row.id,
        title: row.title,
        lastMessageAt: row.last_message_at,
        createdAt: row.created_at,
        partnerId: partner?.id ?? null,
        partnerName: partner?.name ?? null,
        partnerAvatarAssetId: partner?.avatarAssetId ?? null,
      },
      error: null,
    };
  }

  async function findDirectConversationId(userA: string, userB: string): Promise<string | null> {
    const { data: aRows } = await client
      .from('conversation_members')
      .select('conversation_id')
      .eq('user_id', userA)
      .is('left_at', null);
    if (!aRows || aRows.length === 0) return null;
    const ids = aRows.map((row) => row.conversation_id);
    const { data: bRows } = await client
      .from('conversation_members')
      .select('conversation_id')
      .eq('user_id', userB)
      .in('conversation_id', ids)
      .is('left_at', null);
    return bRows?.[0]?.conversation_id ?? null;
  }

  return {
    async listConversations(userId: string): Promise<ChatResult<ChatConversation[]>> {
      const { data: memberships, error: membershipError } = await client
        .from('conversation_members')
        .select('conversation_id')
        .eq('user_id', userId)
        .is('left_at', null)
        .order('joined_at', { ascending: false });
      if (membershipError || !memberships) return { data: null, error: CHAT_LOAD_ERROR };

      const ids = memberships.map((row) => row.conversation_id);
      if (ids.length === 0) return { data: [], error: null };

      const { data: rows, error: conversationError } = await client
        .from('conversations')
        .select('*')
        .in('id', ids)
        .order('last_message_at', { ascending: false, nullsFirst: false });
      if (conversationError || !rows) return { data: null, error: CHAT_LOAD_ERROR };

      const conversations: ChatConversation[] = [];
      for (const row of rows) {
        const partner = await loadPartner(row.id, userId);
        conversations.push({
          id: row.id,
          title: row.title,
          lastMessageAt: row.last_message_at,
          createdAt: row.created_at,
          partnerId: partner?.id ?? null,
          partnerName: partner?.name ?? null,
          partnerAvatarAssetId: partner?.avatarAssetId ?? null,
        });
      }
      return { data: conversations, error: null };
    },

    async getMessages(conversationId: string, limit = 200): Promise<ChatResult<ChatMessage[]>> {
      const { data, error } = await client
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .is('deleted_at', null)
        .order('created_at', { ascending: true })
        .limit(Math.max(1, Math.min(limit, 500)));
      if (error || !data) return { data: null, error: CHAT_LOAD_ERROR };
      return { data: data.map((row) => toMessage(row)), error: null };
    },

    async sendMessage(conversationId: string, senderId: string, body: string): Promise<ChatResult<ChatMessage>> {
      const text = body.trim();
      if (!text) return { data: null, error: 'You cannot send an empty message.' };
      const { data, error } = await client
        .from('messages')
        .insert({ conversation_id: conversationId, sender_id: senderId, body: text, message_type: 'text' })
        .select('*')
        .single();
      if (error || !data) return { data: null, error: CHAT_SEND_ERROR };
      return { data: toMessage(data), error: null };
    },

    async startConversation(currentUserId: string, targetUserId: string): Promise<ChatResult<ChatConversation>> {
      if (!currentUserId || !targetUserId) return { data: null, error: CHAT_START_ERROR };
      if (currentUserId === targetUserId) return { data: null, error: 'You cannot start a conversation with yourself.' };

      // Best-effort hygiene: delete the caller's own zero-member direct threads
      // left behind by earlier failed flows (migration 0039). Never blocks.
      await client.rpc('prune_empty_direct_conversations');

      const existingId = await findDirectConversationId(currentUserId, targetUserId);
      if (existingId) {
        const existing = await loadConversation(existingId, currentUserId);
        if (existing.data) return { data: existing.data, error: null };
      }

      const { data: created, error: conversationError } = await client
        .from('conversations')
        .insert({ conversation_type: 'direct', creator_id: currentUserId })
        .select('id')
        .single();
      if (conversationError || !created) return { data: null, error: CHAT_START_ERROR };

      const { data: memberPayload, error: memberError } = await client.rpc('add_conversation_members', {
        p_conversation_id: created.id,
        p_member_user_ids: [currentUserId, targetUserId],
      });
      // The RPC is the only path that may insert conversation_members (0037);
      // on success it returns { ok: true, added } and on scope violations an error key.
      const memberResult = (memberPayload ?? null) as
        | { ok?: boolean; error?: string | null; added?: number }
        | null;
      if (memberError || !memberResult?.ok || (memberResult.added ?? 0) < 2) {
        return { data: null, error: CHAT_START_ERROR };
      }

      const conversationResult = await loadConversation(created.id, currentUserId);
      if (!conversationResult.data) return { data: null, error: conversationResult.error ?? CHAT_START_ERROR };
      return { data: conversationResult.data, error: null };
    },
  };
}

export type ChatService = ReturnType<typeof createChatService>;
