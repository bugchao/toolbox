import { analyzeDnsLatency } from './dns-latency-service.js'

export function registerDnsLatencyApiRoutes(app) {
  app.post('/api/dns/latency', async (req, res) => {
    const { domain, type = 'A' } = req.body
    if (!domain) return res.status(400).json({ error: '请输入域名' })
    try {
      const result = await analyzeDnsLatency(domain.trim(), type)
      res.json(result)
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  })
}
