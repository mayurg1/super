import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types.js';

export type RealtimeClient = Pick<SupabaseClient<Database>, 'channel' | 'removeChannel' | 'removeAllChannels'>;

export function createRealtime(client: SupabaseClient<Database>): RealtimeClient {
  return client;
}
