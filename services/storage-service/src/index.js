import { defineServiceModule } from '@toolbox/service-core'
import { registerStoreApiRoutes } from '../../../server/store-api.js'

export const storageService = defineServiceModule({
  id: 'storage-service',
  name: 'Storage Service',
  version: '1.0.0',
  kind: 'domain',
  summary: 'Persistent local storage APIs for tools and app state.',
  capabilities: ['store-api'],
  routePrefixes: ['/api/store'],
  async register(app) {
    await registerStoreApiRoutes(app).catch((error) => {
      console.warn('[store-api] init error:', error.message)
    })
  },
})
