import { checkNxdomain } from './dns-nxdomain-service.js';

/**
 * 注册 DNS NXDOMAIN 检测 API 路由
 * @param {import('express').Application} app - Express 应用实例
 */
export function registerDnsNxdomainApiRoutes(app) {
  app.post('/api/dns/nxdomain', async (req, res) => {
    try {
      const { domain } = req.body || {};
      
      if (!domain) {
        return res.status(400).json({ error: 'Domain is required' });
      }
      
      const result = await checkNxdomain(domain);
      res.json(result);
    } catch (error) {
      res.status(400).json({ 
        error: error.message || 'Query failed',
        domain: req.body?.domain
      });
    }
  });
}
