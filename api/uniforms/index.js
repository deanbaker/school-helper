import { getUniform, sydneyDate, sydneyNow } from '../../lib/getUniforms.js';

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');

  // Before 9am → today's uniform. 10am or later → tomorrow's.
  const hour = sydneyNow().getHours();
  const smartOffset = hour >= 10 ? 1 : 0;
  const dateStr = req.query.date || sydneyDate(smartOffset);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD.' });
    return;
  }

  res.json({
    frankie: getUniform('frankie', dateStr),
    maisie: getUniform('maisie', dateStr),
  });
}
