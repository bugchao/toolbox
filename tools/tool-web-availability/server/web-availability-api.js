import { checkAvailability } from './web-availability-service.js'

export function registerWebAvailabilityApiRoutes(app) {
  app.post('/api/web/availability', async (req, res) => {
    try {
      const { urls } = req.body
      if (!urls) return res.status(400).json({ error: '缺少 urls 参数' })
      const result = await checkAvailability(urls)
      res.json(result)
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })
}
