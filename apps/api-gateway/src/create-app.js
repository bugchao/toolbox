import path from 'node:path'
import express from 'express'
import {
  createRequestContextMiddleware,
  findFirstExistingDirectory,
  registerServiceModules,
} from '@toolbox/service-core'
import { legacyToolsService } from '@toolbox/legacy-tools-service'

export async function createApiGatewayApp({ rootDir }) {
  const app = express()
  app.disable('x-powered-by')
  app.use(createRequestContextMiddleware())
  app.use(express.json({ limit: '1mb' }))

  const services = await registerServiceModules(app, [legacyToolsService], { rootDir })

  app.get('/health', (req, res) => {
    res.json({
      ok: true,
      gateway: 'api-gateway',
      services: services.length,
      now: new Date().toISOString(),
    })
  })

  app.get('/ready', (req, res) => {
    const failed = services.filter((service) => service.status !== 'ready')
    const payload = {
      ok: failed.length === 0,
      failedServices: failed,
      services,
    }

    res.status(failed.length ? 503 : 200).json(payload)
  })

  app.get('/api/system/services', (req, res) => {
    res.json({
      gateway: 'api-gateway',
      services,
    })
  })

  const staticDir = findFirstExistingDirectory([
    path.join(rootDir, 'apps/web/dist'),
    path.join(rootDir, 'dist'),
  ])

  if (staticDir) {
    app.use(express.static(staticDir))
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api/')) {
        next()
        return
      }

      res.sendFile(path.join(staticDir, 'index.html'))
    })
  }

  return {
    app,
    services,
    staticDir,
  }
}

