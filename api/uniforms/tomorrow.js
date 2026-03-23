import { getUniform, sydneyDate } from '../../lib/getUniforms.js';

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');

  const dateStr = sydneyDate(1);

  res.json({
    frankie: getUniform('frankie', dateStr),
    maisie: getUniform('maisie', dateStr),
  });
}
