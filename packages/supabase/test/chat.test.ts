import { describe, expect, it } from 'vitest';
import { createMockClient } from './helpers/mockClient';
import { createChatService } from '../src/chat';

type Client = Parameters<typeof createChatService>[0];

describe('createChatService', () => {
  it('startConversation creates a conversation and adds both members', async () => {
    let pruned = 0;
    const client = createMockClient({
      conversation_members: (call) => {
        // call 1: findDirectConversationId (viewer memberships) -> empty
        // call 2: loadPartner (peer lookup) -> single peer
        if (call === 1) return { data: [], error: null };
        return { data: [{ user_id: 'user-2' }], error: null };
      },
      conversations: (call) => {
        // call 1: insert -> id; call 2: loadConversation -> full row
        const base = {
          id: 'conv-1',
          conversation_type: 'direct',
          creator_id: 'user-1',
          title: null,
          last_message_at: null,
          created_at: '2026-01-01T00:00:00Z',
          updated_at: '2026-01-01T00:00:00Z',
        };
        if (call === 1) return { data: { id: base.id }, error: null };
        return { data: base, error: null };
      },
      profiles: () => ({
        data: { id: 'user-2', display_name: 'Peer', avatar_asset_id: null },
        error: null,
      }),
    }, {
      prune_empty_direct_conversations: () => { pruned += 1; return { data: { ok: true }, error: null }; },
      add_conversation_members: () => ({ data: { ok: true, added: 2 }, error: null }),
    });
    const service = createChatService(client as unknown as Client);

    const result = await service.startConversation('user-1', 'user-2');
    expect(pruned).toBe(1);
    expect(result.error).toBeNull();
    expect(result.data?.id).toBe('conv-1');
    expect(result.data?.partnerId).toBe('user-2');
  });

  it('startConversation rejects a self-conversation', async () => {
    const client = createMockClient({});
    const service = createChatService(client as unknown as Client);

    const result = await service.startConversation('user-1', 'user-1');
    expect(result.error).toContain('yourself');
    expect(result.data).toBeNull();
  });

  it('sendMessage returns an error when the insert fails', async () => {
    const client = createMockClient({
      messages: () => ({ data: null, error: { message: 'db down' } }),
    });
    const service = createChatService(client as unknown as Client);

    const result = await service.sendMessage('conv-1', 'user-1', 'hello');
    expect(result.error).toContain('could not be sent');
    expect(result.data).toBeNull();
  });

  it('startConversation fails loudly when the membership RPC is scoped away', async () => {
    const client = createMockClient(
      {
        conversation_members: () => ({ data: [], error: null }),
        conversations: () => ({ data: { id: 'conv-1' }, error: null }),
        profiles: () => ({ data: { id: 'user-2', display_name: 'Peer', avatar_asset_id: null }, error: null }),
      },
      {
        add_conversation_members: () => ({ data: { ok: false, error: 'NOT_CREATOR', added: 0 }, error: null }),
      },
    );
    const service = createChatService(client as unknown as Client);

    const result = await service.startConversation('user-1', 'user-2');
    expect(result.error).toContain('could not be started');
    expect(result.data).toBeNull();
  });
});