import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createApiGatewayApp } from './create-app.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const defaultRootDir = path.resolve(__dirname, '../../..')

export async function startApiGateway(options = {}) {
  const rootDir = options.rootDir ?? defaultRootDir
  const port = Number(process.env.PORT || 3000)
  const host = process.env.HOST || '0.0.0.0'
  const { app, staticDir, services } = await createApiGatewayApp({ rootDir })

  return app.listen(port, host, () => {
    console.log(`[api-gateway] listening on http://${host}:${port}`)
    if (staticDir) {
      console.log(`[api-gateway] serving static assets from ${staticDir}`)
    }
    console.log(`[api-gateway] registered services: ${services.map((service) => service.id).join(', ')}`)
  })
}

if (process.argv[1] === __filename) {
  startApiGateway().catch((error) => {
    console.error('[api-gateway] failed to start:', error)
    process.exitCode = 1
  })
}

