export function requireApiKey(req, res) {
  const key = req.headers['x-api-key'] || req.query.apiKey;
  if (!process.env.API_KEY || key !== process.env.API_KEY) {
    res.status(401).json({ error: 'Unauthorized' });
    return false;
  }
  return true;
}
