export interface MockQueryResult<T = unknown> {
  data: T | null;
  error: { message: string } | null;
}

export type MockTableHandler = (call: number) => MockQueryResult;

interface MockBuilder {
  select: () => MockBuilder;
  eq: () => MockBuilder;
  neq: () => MockBuilder;
  in: () => MockBuilder;
  is: () => MockBuilder;
  not: () => MockBuilder;
  or: () => MockBuilder;
  gt: () => MockBuilder;
  lt: () => MockBuilder;
  order: () => MockBuilder;
  limit: () => MockBuilder;
  maybeSingle: () => Promise<MockQueryResult>;
  single: () => Promise<MockQueryResult>;
  upsert: () => MockBuilder;
  insert: () => MockBuilder;
  update: () => MockBuilder;
  delete: () => Promise<MockQueryResult>;
  then: <T>(onFulfilled: (value: MockQueryResult) => T) => Promise<T>;
}

function createBuilder(getResult: () => MockQueryResult): MockBuilder {
  const chain: MockBuilder = {
    select: () => chain,
    eq: () => chain,
    neq: () => chain,
    in: () => chain,
    is: () => chain,
    not: () => chain,
    or: () => chain,
    gt: () => chain,
    lt: () => chain,
    order: () => chain,
    limit: () => chain,
    maybeSingle: () => Promise.resolve(getResult()),
    single: () => Promise.resolve(getResult()),
    upsert: () => chain,
    insert: () => chain,
    update: () => chain,
    delete: () => Promise.resolve(getResult()),
    then: <T>(onFulfilled: (value: MockQueryResult) => T): Promise<T> =>
      Promise.resolve(getResult()).then(onFulfilled),
  };
  return chain;
}

/**
 * Minimal fake Supabase client for unit tests. Each `.from(table)` call returns a
 * chainable query builder that resolves to the table's handler result.
 * The handler receives the number of the call to that table (1-based) so tests
 * can answer multiple queries against the same table differently.
 */
export function createMockClient(
  handlers: Record<string, MockTableHandler>,
  rpcHandlers?: Record<string, () => MockQueryResult>,
): {
  from: (table: string) => MockBuilder;
  rpc: (fn: string) => Promise<MockQueryResult>;
} {
  const counters: Record<string, number> = {};
  return {
    from(table: string): MockBuilder {
      const handler = handlers[table] ?? (() => ({ data: null, error: null }));
      return createBuilder(() => {
        counters[table] = (counters[table] ?? 0) + 1;
        return handler(counters[table]);
      });
    },
    rpc(fn: string): Promise<MockQueryResult> {
      const handler = rpcHandlers?.[fn] ?? (() => ({ data: null, error: null }));
      return handler();
    },
  };
}