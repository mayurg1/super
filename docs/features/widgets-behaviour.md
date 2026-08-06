# External API Widgets — Behaviour Specification

**Source:** `superold/www/app.js` (canonical inline implementation)  
**Cross-check:** `superold/src/features/widgets/` (partial migration — adds optional news widget)

---

## Trigger

After main dashboard render, three widgets load on staggered timers:

| Widget | Delay |
|--------|-------|
| Weather | 150 ms |
| Quote | 250 ms |
| Joke | 350 ms |

News loads only when `#news-widget` exists in the DOM (partial migration addition).

---

## 1. Weather Widget

**Mount point:** Immediately after `.feed-header` (`insertAdjacentElement('afterend')`)  
**Element id:** `weather-widget`

**Loading state:** 🌤️ (24px) + "Loading campus weather…"

**API:** Open-Meteo  
`https://api.open-meteo.com/v1/forecast?latitude=17.98&longitude=79.53&current_weather=true&wind_speed_unit=kmh`

**Location:** NIT Warangal area (17.98, 79.53)

**Success display:**
- Emoji from WMO weather code mapping
- `{temperature}°C · {condition}`
- Subtext: `💨 Wind {speed} km/h · Campus Live Weather`

**Weather code mapping:**

| Code range | Emoji | Condition |
|------------|-------|-----------|
| ≤ 1 | ☀️ | Clear |
| ≤ 3 | 🌤️ | Partly Cloudy |
| ≤ 45 | 🌫️ | Foggy |
| ≤ 67 | 🌧️ | Rainy |
| ≤ 77 | ❄️ | Snowy |
| else | ⛈️ | Stormy |

**Error state:** 🌤️ (20px) + "Weather unavailable" (no fallback data)

**Skip condition:** No `.feed-header` in DOM

---

## 2. Daily Inspiration Quote

**Mount point:** Before `.settings-section` (`insertAdjacentElement('beforebegin')`)  
**Container id:** `quote-card-container` (added in partial migration for idempotent refresh)

**Loading state:** "Loading quote…"

**API:** Quotable.io  
`https://api.quotable.io/quotes/random?limit=1&tags=education|wisdom|inspirational`

**Success display:**
- Text: `"{content}"` (italic)
- Author: `— {author}`
- Header label: `💡 DAILY INSPIRATION`

**Fallback (API failure):**
- Quote: "Education is the most powerful weapon which you can use to change the world."
- Author: Nelson Mandela

**Skip condition:** No `.settings-section` in DOM

---

## 3. Campus Joke

**Mount point:** Appended to `#feed-posts`  
**Element id:** `joke-feed-card`

**Card structure:** Feed card with:
- Avatar: 😂 (bg-teal)
- User: "Campus AI Comedy Bot"
- Time: " · live"
- Badge: "🎭 Humour"
- Loading text: "Fetching your daily campus laugh…"
- Actions: like (😂 0) and share buttons

**API:** JokeAPI  
`https://v2.jokeapi.dev/joke/Programming,Miscellaneous?blacklistFlags=nsfw,racist,sexist,explicit,religious,political&type=single`

**Success:** Display `data.joke` in `#joke-text`

**Fallback (API failure):**  
"Why did the student eat his homework? Because the teacher told him it was a piece of cake! 🎂"

**Skip condition:** No `#feed-posts` in DOM

---

## 4. News Widget (optional)

**Mount point:** Existing `#news-widget` element  
**Only runs when:** `#news-widget` is present at init time

**Data:** Mock campus news articles (no live API in legacy)  
**Cache:** `localStorage` key `cp_news_cache`, TTL 10 minutes

**Display:** Up to 5 articles with title, summary, time  
**Empty state:** "No news available."

---

## Refresh

Partial migration supports `widgets:refresh` event on EventBus to re-run init.  
Preserved in supernew for cross-feature decoupling.

---

## CSP Requirements

Host page must allow connect to:
- `api.open-meteo.com`
- `api.quotable.io`
- `v2.jokeapi.dev`
