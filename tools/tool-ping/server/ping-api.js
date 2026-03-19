import { pingHost } from './ping-service.js';

export function registerPingApiRoutes(app) {
  app.post('/api/ping', async (req, res) => {
    try {
      const { host, count } = req.body || {};
      if (!host) return res.status(400).json({ error: 'Host is required' });
      const result = await pingHost(host, count || 4);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message || 'Request failed' });
    }
  });
}
