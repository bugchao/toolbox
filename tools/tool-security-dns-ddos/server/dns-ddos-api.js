import { checkDnsDdos } from './dns-ddos-service.js'

export function registerSecurityDnsDdosApiRoutes(app) {
  app.post('/api/security/dns-ddos', async (req, res) => {
    try {
      const { domain } = req.body
      if (!domain) return res.status(400).json({ error: '缺少 domain 参数' })
      const result = await checkDnsDdos(domain)
      res.json(result)
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })
}
