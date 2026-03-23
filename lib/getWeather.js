import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const { timezone, location } = JSON.parse(readFileSync(join(__dirname, '..', 'config.json'), 'utf8'));
const { latitude: LAT, longitude: LON } = location;

const RAIN_CODES = new Set([51,53,55,61,63,65,80,81,82,95,96,99]);

// WMO weather code → simple description
function describeCode(code) {
  if (code === 0)    return 'clear skies';
  if (code <= 3)     return 'partly cloudy';
  if (code <= 48)    return 'foggy';
  if (code <= 55)    return 'drizzle';
  if (code <= 65)    return 'rain';
  if (code <= 77)    return 'snow';
  if (code <= 82)    return 'rain showers';
  if (code <= 86)    return 'snow showers';
  return 'thunderstorms';
}

function formatHour(h) {
  if (h === 0)  return 'midnight';
  if (h === 12) return 'midday';
  return h < 12 ? `${h}am` : `${h - 12}pm`;
}

function describeRainTiming(times, precipitation) {
  const rainyHours = times
    .map((t, i) => ({ hour: new Date(t).getHours(), mm: precipitation[i] }))
    .filter(({ mm }) => mm > 0.1)
    .map(({ hour }) => hour);

  if (rainyHours.length === 0) return null;
  if (rainyHours.length >= 20) return 'throughout the day';

  const first = rainyHours[0];
  const last = rainyHours[rainyHours.length - 1];
  return first === last
    ? `around ${formatHour(first)}`
    : `from ${formatHour(first)} to ${formatHour(last)}`;
}

export async function getWeather(dateStr) {
  const url = `https://api.open-meteo.com/v1/forecast`
    + `?latitude=${LAT}&longitude=${LON}`
    + `&daily=temperature_2m_min,temperature_2m_max,weathercode`
    + `&hourly=precipitation`
    + `&timezone=${encodeURIComponent(timezone)}`
    + `&start_date=${dateStr}&end_date=${dateStr}`;

  const res = await fetch(url);
  if (!res.ok) return null;

  const data = await res.json();
  const code = data.daily.weathercode[0];
  const min = Math.round(data.daily.temperature_2m_min[0]);
  const max = Math.round(data.daily.temperature_2m_max[0]);
  const condition = describeCode(code);

  const rainTiming = RAIN_CODES.has(code)
    ? describeRainTiming(data.hourly.time, data.hourly.precipitation)
    : null;

  return { min, max, condition, rainTiming };
}
