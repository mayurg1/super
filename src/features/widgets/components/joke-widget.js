/**
 * @file Campus joke feed card — DOM mount and render only.
 */

const CARD_ID = 'joke-feed-card';
const MOUNT_SELECTOR = '#feed-posts';

/**
 * Ensure joke feed card exists in the DOM.
 * @returns {HTMLElement | null}
 */
export function ensureJokeWidget() {
  const feed = document.getElementById('feed-posts');
  if (!feed) return null;

  let card = document.getElementById(CARD_ID);
  if (!card) {
    card = document.createElement('div');
    card.className = 'feed-card glass-card';
    card.id = CARD_ID;
    card.innerHTML =
      '<div class="post-header">' +
      '<div class="avatar-sm bg-teal">😂</div>' +
      '<div><span class="post-user">Campus AI Comedy Bot</span><span class="post-time"> · live</span></div>' +
      '<span class="post-badge badge-blue">🎭 Humour</span></div>' +
      '<p class="post-text" id="joke-text">Fetching your daily campus laugh…</p>' +
      '<div class="post-actions"><button class="action-btn like-btn" data-post="joke">😂 0</button><button class="action-btn">📤 Share</button></div>';
    feed.appendChild(card);
  }

  return card;
}

/** Render joke loading skeleton. */
export function renderJokeLoading() {
  ensureJokeWidget();
  const textEl = document.getElementById('joke-text');
  if (textEl) textEl.textContent = 'Fetching your daily campus laugh…';
}

/**
 * Render joke text.
 * @param {import('../config.js').JokeData} joke
 */
export function renderJoke(joke) {
  ensureJokeWidget();
  const textEl = document.getElementById('joke-text');
  if (textEl) textEl.textContent = joke.joke;
}
