import { checkCdn } from './cdn-check-service.js'

export function registerCdnCheckApiRoutes(app) {
  app.post('/api/cdn/check', async (req, res) => {
    try {
      const { domain } = req.body
      if (!domain) return res.status(400).json({ error: '缺少 domain 参数' })
      const result = await checkCdn(domain)
      res.json(result)
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })
}
