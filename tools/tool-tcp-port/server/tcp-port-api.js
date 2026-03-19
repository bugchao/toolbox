import { checkTcpPorts } from './tcp-port-service.js';

export function registerTcpPortApiRoutes(app) {
  app.post('/api/tcp/port-check', async (req, res) => {
    try {
      const { host, ports } = req.body || {};
      if (!host) return res.status(400).json({ error: 'Host is required' });
      if (!ports || !Array.isArray(ports) || ports.length === 0) {
        return res.status(400).json({ error: 'Ports array is required' });
      }
      const result = await checkTcpPorts(host, ports);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message || 'Request failed' });
    }
  });
}
