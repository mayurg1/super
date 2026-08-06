/**
 * @file Inspirational quote API client.
 */

import { API_ENDPOINTS, FALLBACK_QUOTE } from '../config.js';

/**
 * Fetch a random education-themed quote.
 * Returns fallback quote on network or parse failure.
 * @returns {Promise<import('../config.js').QuoteData>}
 */
export async function fetchInspirationQuote() {
  try {
    const response = await fetch(API_ENDPOINTS.quote);
    if (!response.ok) throw new Error(`Quote API responded with ${response.status}`);

    const data = await response.json();
    const quote = Array.isArray(data) ? data[0] : null;

    if (!quote?.content || !quote?.author) {
      throw new Error('Invalid quote payload');
    }

    return { content: quote.content, author: quote.author };
  } catch (err) {
    console.warn('[Widgets] Quote fetch failed, using fallback:', err);
    return { ...FALLBACK_QUOTE };
  }
}
