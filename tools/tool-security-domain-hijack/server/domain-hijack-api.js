import { checkDomainHijack } from './domain-hijack-service.js'

export function registerSecurityDomainHijackApiRoutes(app) {
  app.post('/api/security/domain-hijack', async (req, res) => {
    try {
      const { domain } = req.body
      if (!domain) return res.status(400).json({ error: '缺少 domain 参数' })
      const result = await checkDomainHijack(domain)
      res.json(result)
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })
}
