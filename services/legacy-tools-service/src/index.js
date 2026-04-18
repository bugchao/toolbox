import { defineServiceModule } from '@toolbox/service-core'
import { registerStoreApiRoutes } from '../../../server/store-api.js'

export const legacyToolsService = defineServiceModule({
  id: 'legacy-tools-bridge',
  name: 'Legacy Tools Bridge',
  version: '1.0.0',
  kind: 'bridge',
  summary: 'Temporary bridge for store and the final remaining legacy APIs.',
  capabilities: [
    'store-api',
    'legacy-bridge-api',
  ],
  routePrefixes: [
    '/api/store',
  ],
  async register(app) {
    await registerStoreApiRoutes(app).catch((error) => {
      console.warn('[store-api] init error:', error.message)
    })
  },
})
