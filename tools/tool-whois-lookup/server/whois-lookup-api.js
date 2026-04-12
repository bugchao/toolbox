import { lookupWhois } from './whois-lookup-service.js'

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
  if (method !== 'POST' || pathname !== '/api/whois/lookup') return null
  return { statusCode: 200, payload: await lookupWhois(body.query) }
}

export function registerWhoisLookupApiRoutes(app) {
  app.post('/api/whois/lookup', async (req, res) => {
    try {
      res.json(await lookupWhois(req.body?.query))
    } catch (error) {
      res.status(400).json({ error: error.message || 'Request failed' })
    }
  })
}

export function createWhoisLookupApiMiddleware() {
  return async (req, res, next) => {
    try {
      const url = new URL(req.url ?? '', 'http://localhost')
      if (url.pathname !== '/api/whois/lookup') {
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
