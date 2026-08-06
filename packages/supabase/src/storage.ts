import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types.js';

/** Storage façade; buckets are deliberately created only through migrations. */
export type StorageClient = SupabaseClient<Database>['storage'];

export function createStorage(client: SupabaseClient<Database>): StorageClient {
  return client.storage;
}
