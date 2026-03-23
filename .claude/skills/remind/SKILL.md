---
name: remind
description: Add a reminder to reminders.json using natural language. Use when the user says "remind me about X on [date]" or "add a reminder for X".
argument-hint: <event description and date>
---

Add a reminder to `reminders.json` in the project root.

The user said: $ARGUMENTS

Steps:
1. Use today's date from context to resolve any relative date ("next Tuesday", "this Friday", "tomorrow") to a YYYY-MM-DD string.
2. Extract a clean label — the event name without the date reference.
3. Read `reminders.json`.
4. Append a new entry: `{ "label": "<label>", "date": "<YYYY-MM-DD>" }`.
   - Only include `"remindFromDate"` if the user explicitly says when to start reminding; otherwise omit it (the app defaults to Monday of the event's week).
5. Write the updated JSON back to `reminders.json`.
6. Run: `git add reminders.json && git commit -m "Add reminder: <label>" && git push`
7. Confirm to the user: show the label, resolved date, when reminders will start appearing (Monday of that week), and that the change has been pushed so Vercel will deploy it.
