/**
 * @file Daily inspiration quote widget — DOM mount and render only.
 */

const CONTAINER_ID = 'quote-card-container';
const MOUNT_SELECTOR = '.settings-section';

/**
 * Ensure quote card container exists in the DOM.
 * @returns {HTMLElement | null}
 */
export function ensureQuoteWidget() {
  const anchor = document.querySelector(MOUNT_SELECTOR);
  if (!anchor) return null;

  let container = document.getElementById(CONTAINER_ID);
  if (!container) {
    container = document.createElement('div');
    container.id = CONTAINER_ID;
    container.style.cssText = 'margin-bottom:12px;';
    container.innerHTML =
      '<div class="glass-card" style="padding:16px;border-left:3px solid var(--c-purple)">' +
      '<div style="font-size:12px;font-weight:600;color:var(--c-purple);margin-bottom:6px">💡 DAILY INSPIRATION</div>' +
      '<p id="quote-text" style="font-size:14px;line-height:1.6;color:var(--c-text);font-style:italic">Loading quote…</p>' +
      '<div id="quote-author" style="font-size:12px;color:var(--c-text2);margin-top:6px;font-weight:500"></div>' +
      '</div>';
    anchor.insertAdjacentElement('beforebegin', container);
  }

  return container;
}

/** Render quote loading skeleton. */
export function renderQuoteLoading() {
  ensureQuoteWidget();
  const textEl = document.getElementById('quote-text');
  const authorEl = document.getElementById('quote-author');
  if (textEl) textEl.textContent = 'Loading quote…';
  if (authorEl) authorEl.textContent = '';
}

/**
 * Render quote content.
 * @param {import('../config.js').QuoteData} quote
 */
export function renderQuote(quote) {
  ensureQuoteWidget();
  const textEl = document.getElementById('quote-text');
  const authorEl = document.getElementById('quote-author');
  if (textEl) textEl.textContent = `"${quote.content}"`;
  if (authorEl) authorEl.textContent = `— ${quote.author}`;
}
