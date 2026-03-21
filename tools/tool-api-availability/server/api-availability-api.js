import { checkApiAvailability } from './api-availability-service.js'

export function registerApiAvailabilityApiRoutes(app) {
  app.post('/api/network/api-availability', async (req, res) => {
    try {
      const { endpoints } = req.body
      if (!endpoints || !Array.isArray(endpoints) || endpoints.length === 0) {
        return res.status(400).json({ error: '缺少 endpoints 参数' })
      }
      if (endpoints.length > 10) {
        return res.status(400).json({ error: '最多支持 10 个端点' })
      }
      const result = await checkApiAvailability(endpoints)
      res.json(result)
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })
}
