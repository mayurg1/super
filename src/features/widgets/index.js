/**
 * @file External API Widgets — public feature entry point.
 *
 * Fetches third-party data (weather, quotes, jokes, news) and renders
 * widgets into predefined DOM mount points. Designed for clean imports —
 * no window globals required.
 */

import { eventBus } from '../../core/event-bus.js';
import { WIDGET_EVENTS } from './config.js';
import { scheduleWidgetLoads } from './scheduler.js';

/** @type {(() => void) | null} */
let unsubscribeRefresh = null;

/**
 * Initialize external API widgets.
 * Mounts skeleton UI, schedules staggered fetches, and listens for refresh events.
 * @returns {void}
 */
export function initWidgets() {
  console.log('[Widgets] Initialized');

  unsubscribeRefresh?.();
  unsubscribeRefresh = eventBus.on(WIDGET_EVENTS.refresh, () => {
    scheduleWidgetLoads();
  });

  scheduleWidgetLoads();
}

/**
 * Tear down widget event subscriptions.
 * @returns {void}
 */
export function destroyWidgets() {
  unsubscribeRefresh?.();
  unsubscribeRefresh = null;
}

/** Re-fetch and re-render all widgets. */
export function refreshWidgets() {
  eventBus.emit(WIDGET_EVENTS.refresh);
}

export default { init: initWidgets, refresh: refreshWidgets, destroy: destroyWidgets };
