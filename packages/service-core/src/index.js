import crypto from 'node:crypto'
import fs from 'node:fs'

export function defineServiceModule(definition) {
  return definition
}

export function createRequestContextMiddleware() {
  return function requestContextMiddleware(req, res, next) {
    const requestId = req.get('x-request-id') || crypto.randomUUID()
    req.requestId = requestId
    res.setHeader('x-request-id', requestId)
    next()
  }
}

export async function registerServiceModules(app, modules, context, options = {}) {
  const { failFast = false } = options
  const services = []

  for (const service of modules) {
    try {
      await service.register(app, context)
      services.push({
        id: service.id,
        name: service.name,
        version: service.version ?? '1.0.0',
        kind: service.kind ?? 'domain',
        capabilities: service.capabilities ?? [],
        summary: service.summary ?? '',
        routePrefixes: service.routePrefixes ?? [],
        status: 'ready',
      })
    } catch (error) {
      services.push({
        id: service.id,
        name: service.name,
        version: service.version ?? '1.0.0',
        kind: service.kind ?? 'domain',
        capabilities: service.capabilities ?? [],
        summary: service.summary ?? '',
        routePrefixes: service.routePrefixes ?? [],
        status: 'failed',
        error: error instanceof Error ? error.message : String(error),
      })

      if (failFast) throw error
    }
  }

  return services
}

export function findFirstExistingDirectory(candidates) {
  return candidates.find((candidate) => fs.existsSync(candidate)) ?? null
}
