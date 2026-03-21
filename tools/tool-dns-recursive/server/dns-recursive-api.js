import { checkDnsRecursive } from './dns-recursive-service.js'

export function registerDnsRecursiveApiRoutes(app) {
  app.post('/api/dns/recursive', async (req, res) => {
    let { targets } = req.body
    if (!targets || !targets.length) return res.status(400).json({ error: '请输入IP地址' })
    if (targets.length > 10) targets = targets.slice(0, 10)
    try {
      const result = await checkDnsRecursive(targets)
      res.json(result)
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  })
}
