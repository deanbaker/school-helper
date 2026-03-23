---
name: remind
description: Add a reminder to reminders.json and deploy it to Vercel. Use when the user says "remind me about X on [date]" or "add a reminder for X".
argument-hint: <event description and date>
---

Add a reminder to `reminders.json` in the project root.

The user said: $ARGUMENTS

Determine whether this is a **one-off** or **recurring** reminder:
- **Recurring**: mentions "every [day]", "each [day]", or "[day]s" (e.g. "every Wednesday", "Tuesdays") — no specific date.
- **One-off**: mentions a specific date or relative date ("next Tuesday", "this Friday", "tomorrow").

**For a recurring reminder:**
1. Extract a clean label (event name without the day reference).
2. Identify the day name (e.g. "Wednesday").
3. Read `reminders.json`.
4. Append: `{ "label": "<label>", "day": "<DayName>" }`.
5. Write the updated JSON back to `reminders.json`.

**For a one-off reminder:**
1. Use today's date from context to resolve the date to YYYY-MM-DD.
2. Extract a clean label (event name without the date reference).
3. Read `reminders.json`.
4. Append: `{ "label": "<label>", "date": "<YYYY-MM-DD>" }`.
   - Only include `"remindFromDate"` if the user explicitly says when to start reminding; otherwise omit it (defaults to Monday of the event's week).
5. Write the updated JSON back to `reminders.json`.

**Finalise (both types)**
1. Push the updated `REMINDERS_JSON` env var to Vercel by running these commands in sequence:
   ```
   npx vercel env rm REMINDERS_JSON production --yes
   cat reminders.json | npx vercel env add REMINDERS_JSON production
   npx vercel --prod --yes
   ```
2. Confirm to the user: show the label, the date or day it applies to, and that the change is live on Vercel.
