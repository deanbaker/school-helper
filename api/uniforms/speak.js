import { getUniform, sydneyDate, sydneyNow } from '../../lib/getUniforms.js';
import { getWeather } from '../../lib/getWeather.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');

  const hour = sydneyNow().getHours();
  const isTomorrow = hour >= 10;
  const dateStr = req.query.date || sydneyDate(isTomorrow ? 1 : 0);

  const frankie = getUniform('frankie', dateStr);
  const maisie = getUniform('maisie', dateStr);
  const weather = await getWeather(dateStr);
  const when = isTomorrow ? 'Tomorrow' : 'Today';

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

  res.setHeader('Content-Type', 'text/plain');
  res.send(message);
}
