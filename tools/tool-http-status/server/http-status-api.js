import { checkHttpStatus } from './http-status-service.js';

export function registerHttpStatusApiRoutes(app) {
  app.post('/api/http/status', async (req, res) => {
    try {
      const { url } = req.body || {};
      if (!url) return res.status(400).json({ error: 'URL is required' });
      const result = await checkHttpStatus(url);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message || 'Request failed' });
    }
  });
}
