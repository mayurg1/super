/**
 * @file Campus news widget — renders into existing #news-widget mount.
 */

import { escapeHtml } from '../../../shared/dom/escape-html.js';

const MOUNT_ID = 'news-widget';
const MAX_ARTICLES = 5;

/**
 * @returns {HTMLElement | null}
 */
export function getNewsMount() {
  return document.getElementById(MOUNT_ID);
}

/**
 * Render news articles into the news widget mount.
 * @param {import('../config.js').NewsArticle[]} articles
 */
export function renderNews(articles) {
  const mount = getNewsMount();
  if (!mount) return;

  if (!articles.length) {
    mount.innerHTML = '<p style="color:var(--c-text2);font-size:13px">No news available.</p>';
    return;
  }

  const items = articles
    .slice(0, MAX_ARTICLES)
    .map(
      (article) =>
        '<div class="news-item">' +
        `<div class="news-title">${escapeHtml(article.title)}</div>` +
        `<div class="news-summary">${escapeHtml(article.summary)}</div>` +
        `<div class="news-time">${escapeHtml(article.time)}</div>` +
        '</div>'
    )
    .join('');

  mount.innerHTML = `<div class="news-widget-content">${items}</div>`;
}
