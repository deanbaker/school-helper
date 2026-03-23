---
name: remind
description: Add a reminder to reminders.json using natural language. Use when the user says "remind me about X on [date]" or "add a reminder for X".
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
6. Run: `git add reminders.json && git commit -m "Add recurring reminder: <label>" && git push`
7. Confirm to the user: show the label, the day it will appear on, and that the change has been pushed.

**For a one-off reminder:**
1. Use today's date from context to resolve the date to YYYY-MM-DD.
2. Extract a clean label (event name without the date reference).
3. Read `reminders.json`.
4. Append: `{ "label": "<label>", "date": "<YYYY-MM-DD>" }`.
   - Only include `"remindFromDate"` if the user explicitly says when to start reminding; otherwise omit it (defaults to Monday of the event's week).
5. Write the updated JSON back to `reminders.json`.
6. Run: `git add reminders.json && git commit -m "Add reminder: <label>" && git push`
7. Confirm to the user: show the label, resolved date, when reminders will start appearing (Monday of that week), and that the change has been pushed.

**Finalise**
1. Commit with a clean message, and push to main.