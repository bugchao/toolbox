import { detectDnsTunnel } from './dns-tunnel-service.js'

export function registerDnsTunnelApiRoutes(app) {
  app.post('/api/dns/tunnel', async (req, res) => {
    const { domain } = req.body
    if (!domain) return res.status(400).json({ error: '请输入域名' })
    try {
      const result = await detectDnsTunnel(domain.trim())
      res.json(result)
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  })
}
