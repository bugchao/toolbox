import { defineServiceModule } from '@toolbox/service-core'
import { registerHttpStatusApiRoutes } from '../../../tools/tool-http-status/server/http-status-api.js'

export const utilityService = defineServiceModule({
  id: 'utility-service',
  name: 'Utility Service',
  version: '1.0.0',
  kind: 'domain',
  summary: 'General utility and lookup APIs.',
  capabilities: ['zipcode-api', 'http-status-api'],
  routePrefixes: ['/api/zipcode', '/api/http-status'],
  async register(app) {
    registerHttpStatusApiRoutes(app)

    app.get('/api/zipcode', (req, res) => {
      const q = String(req.query.q || '')

      if (/^\d{6}$/.test(q)) {
        res.json({
          code: q,
          province: '北京市',
          city: '北京市',
          district: '海淀区',
          address: '北京市海淀区相关地址',
        })
        return
      }

      res.json({
        code: '100080',
        province: '北京市',
        city: '北京市',
        district: '海淀区',
        address: q,
      })
    })
  },
})
