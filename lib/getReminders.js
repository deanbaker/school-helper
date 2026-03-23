import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const { reminders } = JSON.parse(process.env.REMINDERS_JSON || readFileSync(join(__dirname, '..', 'reminders.json'), 'utf8'));

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Returns upcoming one-off reminders with event dates >= fromDate, sorted by date.
 * Excludes recurring (day-based) reminders.
 * Each result: { label, date }
 */
export function getUpcomingReminders(fromDate) {
  return reminders
    .filter(r => r.date && r.date >= fromDate)
    .map(r => ({ label: r.label, date: r.date }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Returns active reminders for the given date string (YYYY-MM-DD).
 * One-off: active from Monday of event week (or remindFromDate) through event date.
 * Recurring: active every week on the specified day name.
 * Each result: { label, isToday }
 */
export function getReminders(dateStr) {
  return reminders
    .map(r => {
      // Recurring reminder — has a day name instead of a date
      if (r.day) {
        const dayIndex = new Date(`${dateStr}T12:00:00`).getDay();
        if (DAYS[dayIndex] === r.day) {
          return { label: r.label, isToday: true };
        }
        return null;
      }

      // One-off reminder
      const eventDate = r.date;
      let fromDate = r.remindFromDate;
      if (!fromDate) {
        const d = new Date(`${eventDate}T12:00:00`);
        const dayIndex = d.getDay();
        const daysToMonday = dayIndex === 0 ? 6 : dayIndex - 1;
        d.setDate(d.getDate() - daysToMonday);
        fromDate = d.toLocaleDateString('en-CA');
      }
      if (dateStr >= fromDate && dateStr <= eventDate) {
        return { label: r.label, date: eventDate, isToday: dateStr === eventDate };
      }
      return null;
    })
    .filter(Boolean);
}
