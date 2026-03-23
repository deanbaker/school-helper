import { getUniform, sydneyDate, sydneyNow } from '../../lib/getUniforms.js';

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');

  const hour = sydneyNow().getHours();
  const isTomorrow = hour >= 10;
  const dateStr = req.query.date || sydneyDate(isTomorrow ? 1 : 0);

  const frankie = getUniform('frankie', dateStr);
  const maisie = getUniform('maisie', dateStr);
  const when = isTomorrow ? 'Tomorrow' : 'Today';

  let message;
  if (['holidays', 'weekend', 'no school'].includes(frankie)) {
    message = `${when} is ${frankie}, no uniforms needed.`;
  } else {
    message = `${when}, Frankie is in ${frankie} and Maisie is in ${maisie}.`;
  }

  res.setHeader('Content-Type', 'text/plain');
  res.send(message);
}
