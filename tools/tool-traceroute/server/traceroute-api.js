import { runTraceroute } from './traceroute-service.js'

export function registerTracerouteApiRoutes(app) {
  app.post('/api/traceroute', async (req, res) => {
    try {
      const { target } = req.body
      if (!target) return res.status(400).json({ error: '缺少 target 参数' })
      const result = await runTraceroute(target)
      res.json(result)
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })
}
