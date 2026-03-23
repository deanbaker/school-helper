import { getUniform, localDate } from '../../lib/getUniforms.js';
import { requireApiKey } from '../../lib/auth.js';

export default function handler(req, res) {
  if (!requireApiKey(req, res)) return;
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');

  const dateStr = localDate(1);

  res.json({
    frankie: getUniform('frankie', dateStr),
    maisie: getUniform('maisie', dateStr),
  });
}
