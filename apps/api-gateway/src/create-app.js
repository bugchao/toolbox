import path from 'node:path'
import express from 'express'
import {
  createRequestContextMiddleware,
  findFirstExistingDirectory,
  registerServiceModules,
} from '@toolbox/service-core'
import { contentService } from '@toolbox/content-service'
import { dnsService } from '@toolbox/dns-service'
import { ipService } from '@toolbox/ip-service'
import { securityService } from '@toolbox/security-service'
import { storageService } from '@toolbox/storage-service'
import { utilityService } from '@toolbox/utility-service'

export async function createApiGatewayApp({ rootDir }) {
  const app = express()
  app.disable('x-powered-by')
  app.use(createRequestContextMiddleware())
  app.use(express.json({ limit: '1mb' }))

  const services = await registerServiceModules(
    app,
    [dnsService, ipService, securityService, contentService, utilityService, storageService],
    { rootDir }
  )

  app.get('/health', (req, res) => {
    const readyServices = services.filter((service) => service.status === 'ready')
    res.json({
      ok: readyServices.length === services.length,
      gateway: 'api-gateway',
      services: {
        total: services.length,
        ready: readyServices.length,
        failed: services.length - readyServices.length,
      },
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
    const byKind = services.reduce((acc, service) => {
      acc[service.kind] = (acc[service.kind] || 0) + 1
      return acc
    }, {})

    res.json({
      gateway: 'api-gateway',
      summary: {
        total: services.length,
        byKind,
      },
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
