import { queryCnameChain } from './dns-cname-chain-service.js';

/**
 * 注册 DNS CNAME 链查询 API 路由
 * @param {import('express').Application} app - Express 应用实例
 */
export function registerDnsCnameChainApiRoutes(app) {
  app.post('/api/dns/cname-chain', async (req, res) => {
    try {
      const { domain, maxDepth } = req.body || {};
      
      if (!domain) {
        return res.status(400).json({ error: 'Domain is required' });
      }
      
      const result = await queryCnameChain(domain, maxDepth);
      res.json(result);
    } catch (error) {
      res.status(400).json({ 
        error: error.message || 'Query failed',
        domain: req.body?.domain
      });
    }
  });
}
