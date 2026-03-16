import { queryNsRecords } from './dns-ns-service.js';

/**
 * 注册 DNS NS 查询 API 路由
 * @param {import('express').Application} app - Express 应用实例
 */
export function registerDnsNsApiRoutes(app) {
  app.post('/api/dns/ns', async (req, res) => {
    try {
      const { domain } = req.body || {};
      
      if (!domain) {
        return res.status(400).json({ error: 'Domain is required' });
      }
      
      const result = await queryNsRecords(domain);
      res.json(result);
    } catch (error) {
      res.status(400).json({ 
        error: error.message || 'Query failed',
        domain: req.body?.domain
      });
    }
  });
}
