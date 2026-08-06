import type { PlatformEventMap, EventHandler } from '@supercampus/contracts';

export interface TypedEventBus<TEvents extends object> {
  on<K extends keyof TEvents & string>(
    event: K,
    handler: EventHandler<TEvents[K]>,
  ): () => void;
  off<K extends keyof TEvents & string>(
    event: K,
    handler: EventHandler<TEvents[K]>,
  ): void;
  emit<K extends keyof TEvents & string>(event: K, payload: TEvents[K]): void;
  clear(): void;
}

export function createEventBus<TEvents extends object>(): TypedEventBus<TEvents> {
  const handlers: Partial<Record<keyof TEvents, Set<EventHandler<unknown>>>> = {};

  function getSet<K extends keyof TEvents>(event: K): Set<EventHandler<TEvents[K]>> {
    if (!handlers[event]) {
      handlers[event] = new Set() as Set<EventHandler<unknown>>;
    }
    return handlers[event] as Set<EventHandler<TEvents[K]>>;
  }

  return {
    on(event, handler) {
      getSet(event).add(handler as EventHandler<unknown>);
      return () => this.off(event, handler);
    },
    off(event, handler) {
      getSet(event).delete(handler as EventHandler<unknown>);
    },
    emit(event, payload) {
      const set = handlers[event];
      if (!set) return;
      set.forEach((handler) => {
        try {
          (handler as EventHandler<typeof payload>)(payload);
        } catch (error) {
          console.error(`[eventBus] Handler failed for "${String(event)}"`, error);
        }
      });
    },
    clear() {
      Object.keys(handlers).forEach((key) => {
        handlers[key as keyof TEvents]?.clear();
      });
    },
  };
}

export type PlatformEventBus = TypedEventBus<PlatformEventMap>;

export function createPlatformEventBus(): PlatformEventBus {
  return createEventBus<PlatformEventMap>();
}
