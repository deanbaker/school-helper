import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { getReminders, getUpcomingReminders } from '../lib/getReminders.js';
import { requireApiKey } from '../lib/auth.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const uniforms = JSON.parse(readFileSync(join(__dirname, '..', 'uniforms.json'), 'utf8'));

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function getUniform(child, dateStr) {
  const childData = uniforms.children[child];
  if (!childData) return null;

  if (uniforms.nonSchoolDays.includes(dateStr)) return 'holidays';

  const dayIndex = new Date(`${dateStr}T12:00:00`).getDay();
  if (dayIndex === 0 || dayIndex === 6) return 'weekend';

  if (childData.exceptions[dateStr]) return childData.exceptions[dateStr];

  return childData.schedule[DAYS[dayIndex]] || 'no school';
}

export default function handler(req, res) {
  if (!requireApiKey(req, res)) return;
  const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Australia/Sydney' }));
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

  const week = [];
  for (let i = 0; i < 5; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateStr = d.toLocaleDateString('en-CA');
    week.push({
      date: dateStr,
      day: DAYS[d.getDay()],
      frankie: getUniform('frankie', dateStr),
      maisie: getUniform('maisie', dateStr),
      reminders: getReminders(dateStr).map(r => r.label),
    });
  }

  const today = now.toLocaleDateString('en-CA');

  // Upcoming = one-off reminders from today onwards (includes this week and beyond)
  const upcoming = getUpcomingReminders(today);

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');
  res.json({ week, today, upcoming });
}
