import { traceDnsPath } from './dns-path-viz-service.js'

export function registerDnsPathVizApiRoutes(app) {
  app.post('/api/dns/path-viz', async (req, res) => {
    const { domain, type = 'A' } = req.body
    if (!domain) return res.status(400).json({ error: '请输入域名' })
    try {
      const result = await traceDnsPath(domain.trim(), type)
      res.json(result)
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  })
}
