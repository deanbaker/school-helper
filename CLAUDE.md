# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development

```bash
npm run dev   # runs vercel dev, serves on localhost:3000
```

No build step, no tests, no linter. It's a serverless Node.js project — changes are live on push.

## Deployment

Push to `main` on GitHub → Vercel auto-deploys. The live URL is `https://uniform-mcp.vercel.app`.

## Architecture

All logic is in two config files and three shared libs — API handlers are thin.

**Config files (edit these to customise):**
- `config.json` — timezone, location name, latitude, longitude
- `uniforms.json` — per-child weekly schedule, date-specific exceptions, non-school days

**Shared libs:**
- `lib/getUniforms.js` — reads `uniforms.json`, resolves a uniform for a child+date (priority: non-school day → weekend → exception → weekly schedule). Also exports `localNow()` and `localDate(offset)` which use the timezone from `config.json`.
- `lib/getWeather.js` — fetches from Open-Meteo (no API key) using coordinates from `config.json`. Returns `{ min, max, condition, rainTiming }`. `rainTiming` is a human-readable string like `"from 2pm to 5pm"` derived from hourly precipitation data, only present when rain is forecast.

**API routes (`api/uniforms/`):**
- `index.js` — JSON response. Smart offset: before 10am → today, 10am+ → tomorrow. Accepts `?date=YYYY-MM-DD` override.
- `tomorrow.js` — JSON, always tomorrow.
- `speak.js` — Plain text, human-readable sentence with weather appended. Uses same smart offset. When `?date=` is provided, uses the day name ("Friday") instead of "Today"/"Tomorrow".

**Other:**
- `api/week.js` — Returns Mon–Fri uniform data for the current week, plus upcoming one-off reminders. Consumed by the landing page.
- `public/index.html` — Landing page, fetches `/api/week` and renders a weekly card view with an upcoming reminders section below.

## Key behaviours to preserve

- All date/time logic must use the timezone from `config.json`, never hardcode a timezone.
- The `speak` endpoint returns `Content-Type: text/plain` — Siri shortcuts consume it directly via **Speak Text**.
- Children are keyed by name in `uniforms.json` (e.g. `"frankie"`). The speak endpoint currently hardcodes the names in the sentence — if children are renamed in `uniforms.json`, update `speak.js` too.
