import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const uniforms = JSON.parse(readFileSync(join(__dirname, '..', 'uniforms.json'), 'utf8'));

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function getUniform(child, dateStr) {
  const childData = uniforms.children[child];
  if (!childData) return null;

  if (uniforms.nonSchoolDays.includes(dateStr)) return 'holidays';

  const dayIndex = new Date(`${dateStr}T12:00:00`).getDay();
  if (dayIndex === 0 || dayIndex === 6) return 'weekend';

  if (childData.exceptions[dateStr]) return childData.exceptions[dateStr];

  return childData.schedule[DAYS[dayIndex]] || 'no school';
}

export function sydneyDate(offsetDays = 0) {
  const d = new Date(new Date().toLocaleString('en-US', { timeZone: 'Australia/Sydney' }));
  d.setDate(d.getDate() + offsetDays);
  return d.toLocaleDateString('en-CA');
}
