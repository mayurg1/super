/**
 * @file Pure weather code → display mapping (testable, no DOM).
 */

/**
 * Map Open-Meteo WMO weather code to emoji and human-readable condition.
 * @param {number} code
 * @returns {{ icon: string, condition: string }}
 */
export function mapWeatherCode(code) {
  if (code <= 1) return { icon: '☀️', condition: 'Clear' };
  if (code <= 3) return { icon: '🌤️', condition: 'Partly Cloudy' };
  if (code <= 45) return { icon: '🌫️', condition: 'Foggy' };
  if (code <= 67) return { icon: '🌧️', condition: 'Rainy' };
  if (code <= 77) return { icon: '❄️', condition: 'Snowy' };
  return { icon: '⛈️', condition: 'Stormy' };
}

/**
 * Normalize Open-Meteo API response into widget-ready weather data.
 * @param {Record<string, unknown>} payload
 * @returns {import('../config.js').WeatherData}
 */
export function parseWeatherResponse(payload) {
  const current = /** @type {{ temperature?: number, windspeed?: number, weathercode?: number } | undefined} */ (
    payload?.current_weather
  );

  if (!current || current.weathercode == null || current.temperature == null) {
    throw new Error('Invalid weather payload');
  }

  const { icon, condition } = mapWeatherCode(current.weathercode);

  return {
    temperature: `${Math.round(current.temperature)}°C`,
    condition,
    wind: `${Math.round(current.windspeed ?? 0)} km/h`,
    icon,
  };
}
