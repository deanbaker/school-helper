// Geelong coordinates
const LAT = -38.1499;
const LON = 144.3617;

// WMO weather code → simple description
function describeCode(code) {
  if (code === 0)                          return 'clear skies';
  if (code <= 3)                           return 'partly cloudy';
  if (code <= 48)                          return 'foggy';
  if (code <= 55)                          return 'drizzle';
  if (code <= 65)                          return 'rain';
  if (code <= 77)                          return 'snow';
  if (code <= 82)                          return 'rain showers';
  if (code <= 86)                          return 'snow showers';
  return 'thunderstorms';
}

export async function getWeather(dateStr) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&daily=temperature_2m_min,temperature_2m_max,weathercode&timezone=Australia/Sydney&start_date=${dateStr}&end_date=${dateStr}`;
  const res = await fetch(url);
  if (!res.ok) return null;

  const data = await res.json();
  const min = Math.round(data.daily.temperature_2m_min[0]);
  const max = Math.round(data.daily.temperature_2m_max[0]);
  const condition = describeCode(data.daily.weathercode[0]);

  return { min, max, condition };
}
