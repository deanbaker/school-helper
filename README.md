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

### 2. Set up git-crypt (recommended)

This repo uses [git-crypt](https://github.com/AGWA/git-crypt) to encrypt `config.json` and `uniforms.json`. The versions in this repo are encrypted and unreadable to you — delete them and create your own.

```bash
brew install git-crypt
gpg --full-generate-key          # create a GPG key if you don't have one
git-crypt init
gpg --list-secret-keys --keyid-format LONG  # find your key ID
git-crypt add-gpg-user YOUR_KEY_ID
```

Then add a `.gitattributes` file to encrypt your config files:

```
config.json filter=git-crypt diff=git-crypt
uniforms.json filter=git-crypt diff=git-crypt
```

**Back up your key** — if you lose it, your files are unrecoverable:

```bash
git-crypt export-key ~/git-crypt-backup.key
```

If you don't want encryption, skip this step and just create `config.json` and `uniforms.json` directly.

### 4. Configure your location — `config.json`

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

### 5. Configure your children — `uniforms.json`

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

### 5. Set an API key

All API endpoints require an `API_KEY` environment variable. Set it in your Vercel project:

1. Go to your Vercel project → **Settings → Environment Variables**
2. Add `API_KEY` with a strong random value (e.g. `openssl rand -hex 32`)

Pass the key on every request via header or query param:
- Header: `x-api-key: <your-key>`
- Query param: `?apiKey=<your-key>`

The landing page will prompt for the key on first visit and store it in `localStorage`.

For local development, add it to a `.env` file:

```
API_KEY=your-key-here
```

### 6. Deploy

```bash
git add config.json uniforms.json
git commit -m "Configure for our family"
git push
```

Vercel auto-deploys on every push.

---

## API endpoints

All endpoints require authentication via `x-api-key` header or `?apiKey=` query param.

| Endpoint | Returns |
|---|---|
| `GET /api/uniforms` | JSON — today or tomorrow depending on time of day |
| `GET /api/uniforms?date=YYYY-MM-DD` | JSON — specific date |
| `GET /api/uniforms/tomorrow` | JSON — always tomorrow |
| `GET /api/uniforms/speak` | Plain text — human-readable with weather, for Siri |
| `GET /api/uniforms/speak?date=YYYY-MM-DD` | Plain text — specific date |
| `GET /api/week` | JSON — Mon–Fri schedule for the current week |
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

## Reminders

`reminders.json` lets you attach reminders to the spoken output and weekly card view. Two types are supported:

**One-off reminder** — surfaces from the Monday of the event's week through to the event date itself:

```json
{ "label": "Parent-teacher interviews", "date": "2026-03-31" }
```

Optionally override when it starts appearing with `"remindFromDate": "YYYY-MM-DD"`.

**Recurring reminder** — surfaces every week on the specified day:

```json
{ "label": "Swimming after school", "day": "Wednesday" }
```

Full example:

```json
{
  "reminders": [
    { "label": "Parent-teacher interviews", "date": "2026-03-31" },
    { "label": "Swimming after school", "day": "Wednesday" }
  ]
}
```

Reminders appear appended to the `/api/uniforms/speak` response, e.g.:
> *Reminder: today is Parent-teacher interviews!*
> *Reminder: Swimming after school is on Wednesday.*

They also appear on the weekly landing page card for each relevant day.

> **Note:** `reminders.json` is encrypted with git-crypt alongside `config.json` and `uniforms.json`.

---

## Updating throughout the year

If you're using git-crypt, make sure your repo is unlocked before editing (`git-crypt status` will show `encrypted` next to the files when locked). On a new machine, run `git-crypt unlock ~/git-crypt-backup.key` first.

**Change a uniform day:**
Edit `uniforms.json` → update the relevant day under `schedule` → commit and push.

**Add a school holiday:**
Edit `uniforms.json` → add each date to `nonSchoolDays` → commit and push.

**Add an excursion or mufti day:**
Edit `uniforms.json` → add the date under `exceptions` for the relevant child → commit and push.

---

## Siri shortcut

1. Open **Shortcuts** → New Shortcut
2. Add **Get Contents of URL** → `https://your-project.vercel.app/api/uniforms/speak?apiKey=YOUR_KEY`
3. Add **Speak Text** → input: `Contents of URL`
4. Name it **"School uniforms"** → Add to Siri

Say *"Hey Siri, school uniforms"* — Siri reads today's or tomorrow's uniforms and weather aloud.
