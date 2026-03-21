import { verifyDnssec } from './dnssec-verify-service.js'

export function registerDnssecVerifyApiRoutes(app) {
  app.post('/api/security/dnssec-verify', async (req, res) => {
    try {
      const { domain } = req.body
      if (!domain) return res.status(400).json({ error: '缺少 domain 参数' })
      const result = await verifyDnssec(domain)
      res.json(result)
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })
}
