/**
 * @file Minimal publish/subscribe bus for decoupled feature communication.
 */

/** @typedef {(payload?: unknown) => void} EventHandler */

export class EventBus {
  constructor() {
    /** @type {Map<string, Set<EventHandler>>} */
    this._listeners = new Map();
  }

  /**
   * Subscribe to an event.
   * @param {string} event
   * @param {EventHandler} handler
   * @returns {() => void} Unsubscribe function
   */
  on(event, handler) {
    if (!this._listeners.has(event)) {
      this._listeners.set(event, new Set());
    }
    this._listeners.get(event).add(handler);
    return () => this.off(event, handler);
  }

  /**
   * Remove a handler from an event.
   * @param {string} event
   * @param {EventHandler} handler
   */
  off(event, handler) {
    this._listeners.get(event)?.delete(handler);
  }

  /**
   * Emit an event to all subscribers.
   * @param {string} event
   * @param {unknown} [payload]
   */
  emit(event, payload) {
    const handlers = this._listeners.get(event);
    if (!handlers) return;

    handlers.forEach((handler) => {
      try {
        handler(payload);
      } catch (err) {
        console.error(`[EventBus] Handler failed for "${event}":`, err);
      }
    });
  }
}

/** Shared application event bus instance. */
export const eventBus = new EventBus();
