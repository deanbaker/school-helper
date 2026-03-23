import { getUniform, localDate, localNow } from '../../lib/getUniforms.js';
import { requireApiKey } from '../../lib/auth.js';

export default function handler(req, res) {
  if (!requireApiKey(req, res)) return;
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');

  // Before 9am → today's uniform. 10am or later → tomorrow's.
  const hour = localNow().getHours();
  const smartOffset = hour >= 10 ? 1 : 0;
  const dateStr = req.query.date || localDate(smartOffset);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD.' });
    return;
  }

  res.json({
    frankie: getUniform('frankie', dateStr),
    maisie: getUniform('maisie', dateStr),
  });
}
