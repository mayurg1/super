/**
 * @file Staggered widget load orchestration.
 */

import { WIDGET_LOAD_DELAYS_MS } from '../config.js';
import { fetchCampusWeather } from '../clients/weather-client.js';
import { fetchInspirationQuote } from '../clients/quote-client.js';
import { fetchCampusJoke } from '../clients/joke-client.js';
import { fetchCampusNews } from '../clients/news-client.js';
import {
  renderWeatherLoading,
  renderWeatherSuccess,
  renderWeatherUnavailable,
} from '../components/weather-widget.js';
import { renderQuoteLoading, renderQuote } from '../components/quote-widget.js';
import { renderJokeLoading, renderJoke } from '../components/joke-widget.js';
import { getNewsMount, renderNews } from '../components/news-widget.js';

/**
 * Load and render the weather widget (mount → fetch → render).
 * @returns {Promise<void>}
 */
async function loadWeatherWidget() {
  renderWeatherLoading();
  try {
    const data = await fetchCampusWeather();
    renderWeatherSuccess(data);
  } catch (err) {
    console.warn('[Widgets] Weather load failed:', err);
    renderWeatherUnavailable();
  }
}

/**
 * Load and render the inspiration quote widget.
 * @returns {Promise<void>}
 */
async function loadQuoteWidget() {
  renderQuoteLoading();
  const quote = await fetchInspirationQuote();
  renderQuote(quote);
}

/**
 * Load and render the campus joke feed card.
 * @returns {Promise<void>}
 */
async function loadJokeWidget() {
  renderJokeLoading();
  const joke = await fetchCampusJoke();
  renderJoke(joke);
}

/**
 * Load and render news when mount element exists.
 * @returns {Promise<void>}
 */
async function loadNewsWidget() {
  if (!getNewsMount()) return;
  const articles = await fetchCampusNews();
  renderNews(articles);
}

/**
 * Schedule widget loads with legacy stagger delays.
 * Matches superold/www/app.js timing: 150 / 250 / 350 ms.
 */
export function scheduleWidgetLoads() {
  setTimeout(loadWeatherWidget, WIDGET_LOAD_DELAYS_MS.weather);
  setTimeout(loadQuoteWidget, WIDGET_LOAD_DELAYS_MS.quote);
  setTimeout(loadJokeWidget, WIDGET_LOAD_DELAYS_MS.joke);

  if (getNewsMount()) {
    loadNewsWidget();
  }
}

/** @deprecated Use named exports; kept for testing individual widgets. */
export const widgetLoaders = {
  weather: loadWeatherWidget,
  quote: loadQuoteWidget,
  joke: loadJokeWidget,
  news: loadNewsWidget,
};
