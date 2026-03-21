import { testServerLatency } from './server-latency-service.js'

export function registerServerLatencyApiRoutes(app) {
  app.post('/api/network/server-latency', async (req, res) => {
    try {
      const { targets } = req.body
      if (!targets || !Array.isArray(targets) || targets.length === 0) {
        return res.status(400).json({ error: '缺少 targets 参数' })
      }
      if (targets.length > 5) {
        return res.status(400).json({ error: '最多支持 5 个目标' })
      }
      const result = await testServerLatency(targets)
      res.json(result)
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })
}
