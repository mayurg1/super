/**
 * @file Weather widget — DOM mount and render only.
 */

const WIDGET_ID = 'weather-widget';
const MOUNT_SELECTOR = '.feed-header';

const BASE_STYLE =
  'background:var(--c-surface);border:1px solid var(--c-border);border-radius:14px;padding:10px 16px;margin-bottom:12px;display:flex;align-items:center;gap:12px;font-size:13px;';

/**
 * Ensure weather widget element exists in the DOM.
 * @returns {HTMLElement | null}
 */
export function ensureWeatherWidget() {
  const anchor = document.querySelector(MOUNT_SELECTOR);
  if (!anchor) return null;

  let widget = document.getElementById(WIDGET_ID);
  if (!widget) {
    widget = document.createElement('div');
    widget.id = WIDGET_ID;
    widget.style.cssText = BASE_STYLE;
    anchor.insertAdjacentElement('afterend', widget);
  }

  return widget;
}

/** Render weather loading skeleton. */
export function renderWeatherLoading() {
  const widget = ensureWeatherWidget();
  if (!widget) return;

  widget.innerHTML =
    '<span style="font-size:24px">🌤️</span><span style="color:var(--c-text2)">Loading campus weather…</span>';
}

/**
 * Render weather data.
 * @param {import('../config.js').WeatherData} data
 */
export function renderWeatherSuccess(data) {
  const widget = ensureWeatherWidget();
  if (!widget) return;

  widget.innerHTML =
    `<span style="font-size:24px">${data.icon}</span>` +
    `<div><div style="font-weight:600;color:var(--c-text)">${data.temperature} · ${data.condition}</div>` +
    `<div style="color:var(--c-text2);font-size:11px">💨 Wind ${data.wind} · Campus Live Weather</div></div>`;
}

/** Render weather unavailable state. */
export function renderWeatherUnavailable() {
  const widget = ensureWeatherWidget();
  if (!widget) return;

  widget.innerHTML =
    '<span style="font-size:20px">🌤️</span><span style="color:var(--c-text2)">Weather unavailable</span>';
}
