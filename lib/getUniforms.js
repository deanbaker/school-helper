import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const uniforms = JSON.parse(process.env.UNIFORMS_JSON || readFileSync(join(__dirname, '..', 'uniforms.json'), 'utf8'));
const { timezone } = JSON.parse(process.env.CONFIG_JSON || readFileSync(join(__dirname, '..', 'config.json'), 'utf8'));

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

export function localNow() {
  return new Date(new Date().toLocaleString('en-US', { timeZone: timezone }));
}

export function localDate(offsetDays = 0) {
  const d = localNow();
  d.setDate(d.getDate() + offsetDays);
  return d.toLocaleDateString('en-CA');
}
