import {
  lookupIpBlacklist,
  lookupIpCdn,
  lookupIpGeo,
  lookupIpPtr,
  lookupPublicIp,
} from './ip-ops-service.js'

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode
  if (typeof res.setHeader === 'function') {
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
  }
  res.end(JSON.stringify(payload))
}

async function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') return req.body
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  const raw = Buffer.concat(chunks).toString('utf8')
  return raw ? JSON.parse(raw) : {}
}

async function handleRequest(method, pathname, body = {}) {
  if (pathname === '/api/ip-ops/public' && method === 'GET') {
    return { statusCode: 200, payload: await lookupPublicIp() }
  }

  if (method !== 'POST') return null

  switch (pathname) {
    case '/api/ip-ops/geo':
      return { statusCode: 200, payload: await lookupIpGeo(body.ip) }
    case '/api/ip-ops/ptr':
      return { statusCode: 200, payload: await lookupIpPtr(body.ip) }
    case '/api/ip-ops/cdn':
      return { statusCode: 200, payload: await lookupIpCdn(body.ip) }
    case '/api/ip-ops/blacklist':
      return { statusCode: 200, payload: await lookupIpBlacklist(body.ip) }
    default:
      return null
  }
}

function handleError(res, error) {
  res.status(400).json({ error: error.message || 'Request failed' })
}

export function registerIpOpsApiRoutes(app) {
  app.get('/api/ip-ops/public', async (_req, res) => {
    try {
      res.json(await lookupPublicIp())
    } catch (error) {
      handleError(res, error)
    }
  })

  app.post('/api/ip-ops/geo', async (req, res) => {
    try {
      res.json(await lookupIpGeo(req.body?.ip))
    } catch (error) {
      handleError(res, error)
    }
  })

  app.post('/api/ip-ops/ptr', async (req, res) => {
    try {
      res.json(await lookupIpPtr(req.body?.ip))
    } catch (error) {
      handleError(res, error)
    }
  })

  app.post('/api/ip-ops/cdn', async (req, res) => {
    try {
      res.json(await lookupIpCdn(req.body?.ip))
    } catch (error) {
      handleError(res, error)
    }
  })

  app.post('/api/ip-ops/blacklist', async (req, res) => {
    try {
      res.json(await lookupIpBlacklist(req.body?.ip))
    } catch (error) {
      handleError(res, error)
    }
  })
}

export function createIpOpsApiMiddleware() {
  return async (req, res, next) => {
    try {
      const url = new URL(req.url ?? '', 'http://localhost')
      if (!url.pathname.startsWith('/api/ip-ops/')) {
        next()
        return
      }

      const body = req.method === 'POST' ? await readJsonBody(req) : {}
      const result = await handleRequest(req.method ?? 'GET', url.pathname, body)
      if (!result) {
        sendJson(res, 404, { error: 'Not found' })
        return
      }

      sendJson(res, result.statusCode, result.payload)
    } catch (error) {
      sendJson(res, 400, { error: error.message || 'Request failed' })
    }
  }
}
