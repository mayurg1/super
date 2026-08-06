import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types.js';

export type DatabaseClient = Pick<SupabaseClient<Database>, 'from' | 'rpc' | 'schema'>;

export function createDatabase(client: SupabaseClient<Database>): DatabaseClient {
  return client;
}
