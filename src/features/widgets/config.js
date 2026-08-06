/**
 * @file Widget feature configuration — endpoints, fallbacks, and timing.
 */

/** @typedef {{ content: string, author: string }} QuoteData */
/** @typedef {{ joke: string }} JokeData */
/** @typedef {{ title: string, summary: string, url?: string, time: string }} NewsArticle */
/** @typedef {{ temperature: string, condition: string, wind: string, icon: string }} WeatherData */

export const WIDGET_LOAD_DELAYS_MS = {
  weather: 150,
  quote: 250,
  joke: 350,
};

export const API_ENDPOINTS = {
  weather:
    'https://api.open-meteo.com/v1/forecast?latitude=17.98&longitude=79.53&current_weather=true&wind_speed_unit=kmh',
  quote:
    'https://api.quotable.io/quotes/random?limit=1&tags=education|wisdom|inspirational',
  joke:
    'https://v2.jokeapi.dev/joke/Programming,Miscellaneous?blacklistFlags=nsfw,racist,sexist,explicit,religious,political&type=single',
};

export const STORAGE_KEYS = {
  newsCache: 'cp_news_cache',
};

export const NEWS_CACHE_TTL_MS = 10 * 60 * 1000;

/** @type {QuoteData} */
export const FALLBACK_QUOTE = {
  content: 'Education is the most powerful weapon which you can use to change the world.',
  author: 'Nelson Mandela',
};

/** @type {JokeData} */
export const FALLBACK_JOKE = {
  joke: 'Why did the student eat his homework? Because the teacher told him it was a piece of cake! 🎂',
};

/** @type {NewsArticle[]} */
export const FALLBACK_NEWS = [
  {
    title: 'Campus Placement Season 2024 Begins',
    summary: 'Top recruiters visiting NMIT this semester.',
    url: '#',
    time: '2h ago',
  },
  {
    title: 'New Library Wing Inaugurated',
    summary: 'State-of-the-art facility now open for students.',
    url: '#',
    time: '1d ago',
  },
  {
    title: 'Student Project Wins National Award',
    summary: 'Team from CSE dept wins at hackathon.',
    url: '#',
    time: '3d ago',
  },
];

export const WIDGET_EVENTS = {
  refresh: 'widgets:refresh',
};
