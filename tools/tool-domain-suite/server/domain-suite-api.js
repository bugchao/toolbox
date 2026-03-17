import {
  analyzeDkim,
  analyzeDmarc,
  analyzeHealth,
  analyzeNsCheck,
  analyzeSpf,
  analyzeSubdomainScan,
  analyzeTtlAdvice,
  analyzeWildcard,
} from './domain-suite-service.js'

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
  if (method !== 'POST') return null

  switch (pathname) {
    case '/api/domain-suite/spf':
      return { statusCode: 200, payload: await analyzeSpf(body.domain) }
    case '/api/domain-suite/dkim':
      return { statusCode: 200, payload: await analyzeDkim(body.domain, body.selector) }
    case '/api/domain-suite/dmarc':
      return { statusCode: 200, payload: await analyzeDmarc(body.domain) }
    case '/api/domain-suite/ttl-advice':
      return { statusCode: 200, payload: await analyzeTtlAdvice(body.domain) }
    case '/api/domain-suite/ns-check':
      return { statusCode: 200, payload: await analyzeNsCheck(body.domain) }
    case '/api/domain-suite/subdomain-scan':
      return { statusCode: 200, payload: await analyzeSubdomainScan(body.domain) }
    case '/api/domain-suite/wildcard':
      return { statusCode: 200, payload: await analyzeWildcard(body.domain) }
    case '/api/domain-suite/health':
      return { statusCode: 200, payload: await analyzeHealth(body.domain) }
    default:
      return null
  }
}

function handleError(res, error) {
  res.status(400).json({ error: error.message || 'Request failed' })
}

export function registerDomainSuiteApiRoutes(app) {
  app.post('/api/domain-suite/spf', async (req, res) => {
    try {
      res.json(await analyzeSpf(req.body?.domain))
    } catch (error) {
      handleError(res, error)
    }
  })

  app.post('/api/domain-suite/dkim', async (req, res) => {
    try {
      res.json(await analyzeDkim(req.body?.domain, req.body?.selector))
    } catch (error) {
      handleError(res, error)
    }
  })

  app.post('/api/domain-suite/dmarc', async (req, res) => {
    try {
      res.json(await analyzeDmarc(req.body?.domain))
    } catch (error) {
      handleError(res, error)
    }
  })

  app.post('/api/domain-suite/ttl-advice', async (req, res) => {
    try {
      res.json(await analyzeTtlAdvice(req.body?.domain))
    } catch (error) {
      handleError(res, error)
    }
  })

  app.post('/api/domain-suite/ns-check', async (req, res) => {
    try {
      res.json(await analyzeNsCheck(req.body?.domain))
    } catch (error) {
      handleError(res, error)
    }
  })

  app.post('/api/domain-suite/subdomain-scan', async (req, res) => {
    try {
      res.json(await analyzeSubdomainScan(req.body?.domain))
    } catch (error) {
      handleError(res, error)
    }
  })

  app.post('/api/domain-suite/wildcard', async (req, res) => {
    try {
      res.json(await analyzeWildcard(req.body?.domain))
    } catch (error) {
      handleError(res, error)
    }
  })

  app.post('/api/domain-suite/health', async (req, res) => {
    try {
      res.json(await analyzeHealth(req.body?.domain))
    } catch (error) {
      handleError(res, error)
    }
  })
}

export function createDomainSuiteApiMiddleware() {
  return async (req, res, next) => {
    try {
      const url = new URL(req.url ?? '', 'http://localhost')
      if (!url.pathname.startsWith('/api/domain-suite/')) {
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
