/**
 * @file Campus news client — cached mock data (matches legacy behaviour).
 */

import { FALLBACK_NEWS, NEWS_CACHE_TTL_MS, STORAGE_KEYS } from '../config.js';

/**
 * @typedef {{ data: import('../config.js').NewsArticle[], timestamp: number }} NewsCacheEntry
 */

/**
 * Load campus news articles with localStorage caching.
 * @returns {Promise<import('../config.js').NewsArticle[]>}
 */
export async function fetchCampusNews() {
  const cached = readCache();
  if (cached) return cached;

  const articles = [...FALLBACK_NEWS];
  writeCache(articles);
  return articles;
}

/**
 * @returns {import('../config.js').NewsArticle[] | null}
 */
function readCache() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.newsCache);
    if (!raw) return null;

    /** @type {NewsCacheEntry} */
    const entry = JSON.parse(raw);
    if (!entry?.data || Date.now() - entry.timestamp >= NEWS_CACHE_TTL_MS) {
      return null;
    }

    return entry.data;
  } catch {
    return null;
  }
}

/**
 * @param {import('../config.js').NewsArticle[]} articles
 */
function writeCache(articles) {
  try {
    /** @type {NewsCacheEntry} */
    const entry = { data: articles, timestamp: Date.now() };
    localStorage.setItem(STORAGE_KEYS.newsCache, JSON.stringify(entry));
  } catch {
    // Storage unavailable — non-fatal
  }
}
