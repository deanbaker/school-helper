import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

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
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');

  const sydneyNow = new Date(new Date().toLocaleString('en-US', { timeZone: 'Australia/Sydney' }));
  const today = sydneyNow.toLocaleDateString('en-CA');

  const dateStr = req.query.date || today;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD.' });
    return;
  }

  res.json({
    frankie: getUniform('frankie', dateStr),
    maisie: getUniform('maisie', dateStr),
  });
}
