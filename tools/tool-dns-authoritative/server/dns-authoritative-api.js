import { checkDnsAuthoritative } from './dns-authoritative-service.js'

export function registerDnsAuthoritativeApiRoutes(app) {
  app.post('/api/dns/authoritative', async (req, res) => {
    const { domain } = req.body
    if (!domain) return res.status(400).json({ error: '请输入域名' })
    try {
      const result = await checkDnsAuthoritative(domain.trim())
      res.json(result)
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  })
}
