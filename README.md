# Uniforms MCP

A Vercel-hosted API and MCP server that tells you what uniform your kids need each day, plus the local weather forecast. Built for busy school mornings.

## How it works

- Uniform schedules live in `uniforms.json`
- Location, timezone and weather live in `config.json`
- Before 10am → returns today's info. After 10am → returns tomorrow's
- Deploys automatically when you push to GitHub

---

## Setup for your family

### 1. Fork this repo

Click **Fork** on GitHub, then connect your fork to a new Vercel project.

### 2. Configure your location — `config.json`

```json
{
  "timezone": "Australia/Sydney",
  "location": {
    "name": "Geelong",
    "latitude": -38.1499,
    "longitude": 144.3617
  }
}
```

- **timezone** — use a [TZ database name](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones), e.g. `Australia/Melbourne`, `America/New_York`, `Europe/London`
- **latitude / longitude** — find yours at [latlong.net](https://www.latlong.net)

### 3. Configure your children — `uniforms.json`

```json
{
  "children": {
    "your-child": {
      "schedule": {
        "Monday": "college uniform",
        "Tuesday": "sports uniform",
        "Wednesday": "college uniform",
        "Thursday": "college uniform",
        "Friday": "sports uniform and swimming"
      },
      "exceptions": {
        "2026-04-10": "mufti day"
      }
    }
  },
  "nonSchoolDays": [
    "2026-04-06",
    "2026-04-07"
  ]
}
```

- **schedule** — set a uniform type for each weekday. Use any label you like.
- **exceptions** — one-off dates that override the schedule (excursions, mufti days, etc). Format: `YYYY-MM-DD`.
- **nonSchoolDays** — school holidays and public holidays. Weekends are handled automatically.

### 4. Deploy

```bash
git add config.json uniforms.json
git commit -m "Configure for our family"
git push
```

Vercel auto-deploys on every push.

---

## API endpoints

| Endpoint | Returns |
|---|---|
| `GET /api/uniforms` | JSON — today or tomorrow depending on time of day |
| `GET /api/uniforms?date=YYYY-MM-DD` | JSON — specific date |
| `GET /api/uniforms/tomorrow` | JSON — always tomorrow |
| `GET /api/uniforms/speak` | Plain text — human-readable with weather, for Siri |
| `GET /api/uniforms/speak?date=YYYY-MM-DD` | Plain text — specific date |
| `POST /mcp` | MCP protocol endpoint |

### Example response — `/api/uniforms`

```json
{
  "frankie": "sports uniform and swimming",
  "maisie": "sports uniform"
}
```

### Example response — `/api/uniforms/speak`

```
Friday, Frankie is in sports uniform and swimming and Maisie is in sports uniform. The weather will be 11 to 16 degrees with rain showers, with rain expected from 2pm to 5pm.
```

---

## Updating throughout the year

**Change a uniform day:**
Edit `uniforms.json` → update the relevant day under `schedule` → commit and push.

**Add a school holiday:**
Edit `uniforms.json` → add each date to `nonSchoolDays` → commit and push.

**Add an excursion or mufti day:**
Edit `uniforms.json` → add the date under `exceptions` for the relevant child → commit and push.

---

## Siri shortcut

1. Open **Shortcuts** → New Shortcut
2. Add **Get Contents of URL** → `https://your-project.vercel.app/api/uniforms/speak`
3. Add **Speak Text** → input: `Contents of URL`
4. Name it **"School uniforms"** → Add to Siri

Say *"Hey Siri, school uniforms"* — Siri reads today's or tomorrow's uniforms and weather aloud.
