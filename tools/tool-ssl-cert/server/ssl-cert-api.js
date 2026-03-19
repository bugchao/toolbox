import { getSslCertInfo } from './ssl-cert-service.js';

export function registerSslCertApiRoutes(app) {
  app.post('/api/ssl/cert', async (req, res) => {
    try {
      const { domain, port } = req.body || {};
      if (!domain) return res.status(400).json({ error: 'Domain is required' });
      const result = await getSslCertInfo(domain, port || 443);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message || 'Request failed' });
    }
  });
}
