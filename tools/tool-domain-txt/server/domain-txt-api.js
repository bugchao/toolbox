import { queryTxtRecords } from './domain-txt-service.js';

/**
 * 注册 TXT 记录查询 API 路由
 * @param {import('express').Application} app - Express 应用实例
 */
export function registerDomainTxtApiRoutes(app) {
  app.post('/api/domain/txt', async (req, res) => {
    try {
      const { domain } = req.body || {};
      
      if (!domain) {
        return res.status(400).json({ error: 'Domain is required' });
      }
      
      const result = await queryTxtRecords(domain);
      res.json(result);
    } catch (error) {
      res.status(400).json({ 
        error: error.message || 'Query failed',
        domain: req.body?.domain
      });
    }
  });
}
