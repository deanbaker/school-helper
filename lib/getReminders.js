import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const { reminders } = JSON.parse(readFileSync(join(__dirname, '..', 'reminders.json'), 'utf8'));

/**
 * Returns active reminders for the given date string (YYYY-MM-DD).
 * A reminder is active from Monday of its event week (or remindFromDate) through the event date.
 * Each result: { label, date, isToday }
 */
export function getReminders(dateStr) {
  return reminders
    .map(r => {
      const eventDate = r.date;
      let fromDate = r.remindFromDate;
      if (!fromDate) {
        // Default: Monday of the event's week
        const d = new Date(`${eventDate}T12:00:00`);
        const dayIndex = d.getDay(); // 0=Sun, 1=Mon...
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
