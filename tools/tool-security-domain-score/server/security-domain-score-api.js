import { getDomainScore } from './security-domain-score-service.js'

export function registerSecurityDomainScoreApiRoutes(app) {
  app.post('/api/security/domain-score', async (req, res) => {
    try {
      const { domain } = req.body
      if (!domain) return res.status(400).json({ error: '缺少 domain 参数' })
      const result = await getDomainScore(domain)
      res.json(result)
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })
}
