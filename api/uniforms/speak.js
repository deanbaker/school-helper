import { getUniform, localDate, localNow } from '../../lib/getUniforms.js';
import { getWeather } from '../../lib/getWeather.js';
import { getReminders } from '../../lib/getReminders.js';
import { requireApiKey } from '../../lib/auth.js';

export default async function handler(req, res) {
  if (!requireApiKey(req, res)) return;
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');

  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const hour = localNow().getHours();
  const isTomorrow = hour >= 10;
  const explicitDate = req.query.date;
  const dateStr = explicitDate || localDate(isTomorrow ? 1 : 0);

  const frankie = getUniform('frankie', dateStr);
  const maisie = getUniform('maisie', dateStr);
  const weather = await getWeather(dateStr);
  const when = explicitDate
    ? DAYS[new Date(`${dateStr}T12:00:00`).getDay()]
    : isTomorrow ? 'Tomorrow' : 'Today';

  let message;
  if (['holidays', 'weekend', 'no school'].includes(frankie)) {
    message = `${when} is ${frankie}, no uniforms needed.`;
  } else {
    message = `${when}, Frankie is in ${frankie} and Maisie is in ${maisie}.`;
  }

  if (weather) {
    message += ` The weather will be ${weather.min} to ${weather.max} degrees with ${weather.condition}`;
    message += weather.rainTiming ? `, with rain expected ${weather.rainTiming}.` : `.`;
  }

  const reminders = getReminders(dateStr);
  for (const r of reminders) {
    if (r.isToday) {
      message += ` Reminder: today is ${r.label}!`;
    } else {
      const dayName = DAYS[new Date(`${r.date}T12:00:00`).getDay()];
      message += ` Reminder: ${r.label} is on ${dayName}.`;
    }
  }

  res.setHeader('Content-Type', 'text/plain');
  res.send(message);
}
