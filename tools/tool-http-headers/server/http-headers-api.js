import { getHttpHeaders } from './http-headers-service.js';

export function registerHttpHeadersApiRoutes(app) {
  app.post('/api/http/headers', async (req, res) => {
    try {
      const { url } = req.body || {};
      if (!url) return res.status(400).json({ error: 'URL is required' });
      const result = await getHttpHeaders(url);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message || 'Request failed' });
    }
  });
}
