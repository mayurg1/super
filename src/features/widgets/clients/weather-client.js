/**
 * @file Weather API client — fetch and parse only, no DOM.
 */

import { API_ENDPOINTS } from '../config.js';
import { parseWeatherResponse } from '../utils/weather-codes.js';

/**
 * Fetch current campus weather from Open-Meteo.
 * @returns {Promise<import('../config.js').WeatherData>}
 */
export async function fetchCampusWeather() {
  const response = await fetch(API_ENDPOINTS.weather);

  if (!response.ok) {
    throw new Error(`Weather API responded with ${response.status}`);
  }

  const payload = await response.json();
  return parseWeatherResponse(payload);
}
