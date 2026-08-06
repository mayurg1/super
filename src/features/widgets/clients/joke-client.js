/**
 * @file Campus joke API client.
 */

import { API_ENDPOINTS, FALLBACK_JOKE } from '../config.js';

/**
 * Fetch a safe programming/misc joke.
 * Returns fallback joke on network or parse failure.
 * @returns {Promise<import('../config.js').JokeData>}
 */
export async function fetchCampusJoke() {
  try {
    const response = await fetch(API_ENDPOINTS.joke);
    if (!response.ok) throw new Error(`Joke API responded with ${response.status}`);

    const data = await response.json();
    if (!data?.joke) throw new Error('Invalid joke payload');

    return { joke: data.joke };
  } catch (err) {
    console.warn('[Widgets] Joke fetch failed, using fallback:', err);
    return { ...FALLBACK_JOKE };
  }
}
