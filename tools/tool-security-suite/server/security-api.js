import {
  getDnsVulnerabilityReport,
  getDomainBlacklistReport,
  getIpRiskScore,
  getPortScanReport,
  getSecurityReport,
} from './security-service.js'

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
  for await (const chunk of req) {
    chunks.push(chunk)
  }
  const raw = Buffer.concat(chunks).toString('utf8')
  return raw ? JSON.parse(raw) : {}
}

async function handleRequest(method, pathname, query, body = {}) {
  if (method === 'GET' && pathname === '/api/security/ip-score') {
    const ip = String(query.get('ip') ?? '').trim()
    return { statusCode: 200, payload: await getIpRiskScore(ip) }
  }

  if (method === 'GET' && pathname === '/api/security/domain-blacklist') {
    const domain = String(query.get('domain') ?? '').trim()
    return { statusCode: 200, payload: await getDomainBlacklistReport(domain) }
  }

  if (method === 'GET' && pathname === '/api/security/dns-vuln') {
    const domain = String(query.get('domain') ?? '').trim()
    return { statusCode: 200, payload: await getDnsVulnerabilityReport(domain) }
  }

  if (method === 'POST' && pathname === '/api/security/port-scan') {
    return { statusCode: 200, payload: await getPortScanReport(body) }
  }

  if (method === 'POST' && pathname === '/api/security/report') {
    return { statusCode: 200, payload: await getSecurityReport(body) }
  }

  return null
}

export function registerSecurityApiRoutes(app) {
  app.get('/api/security/ip-score', async (req, res) => {
    try {
      const payload = await getIpRiskScore(String(req.query.ip ?? '').trim())
      res.json(payload)
    } catch (error) {
      res.status(400).json({ error: error.message || 'Request failed' })
    }
  })

  app.get('/api/security/domain-blacklist', async (req, res) => {
    try {
      const payload = await getDomainBlacklistReport(String(req.query.domain ?? '').trim())
      res.json(payload)
    } catch (error) {
      res.status(400).json({ error: error.message || 'Request failed' })
    }
  })

  app.get('/api/security/dns-vuln', async (req, res) => {
    try {
      const payload = await getDnsVulnerabilityReport(String(req.query.domain ?? '').trim())
      res.json(payload)
    } catch (error) {
      res.status(400).json({ error: error.message || 'Request failed' })
    }
  })

  app.post('/api/security/port-scan', async (req, res) => {
    try {
      const payload = await getPortScanReport(req.body ?? {})
      res.json(payload)
    } catch (error) {
      res.status(400).json({ error: error.message || 'Request failed' })
    }
  })

  app.post('/api/security/report', async (req, res) => {
    try {
      const payload = await getSecurityReport(req.body ?? {})
      res.json(payload)
    } catch (error) {
      res.status(400).json({ error: error.message || 'Request failed' })
    }
  })
}

export function createSecurityApiMiddleware() {
  return async (req, res, next) => {
    try {
      const url = new URL(req.url ?? '', 'http://localhost')
      if (!url.pathname.startsWith('/api/security/')) {
        next()
        return
      }

      const body = req.method === 'POST' ? await readJsonBody(req) : {}
      const result = await handleRequest(req.method ?? 'GET', url.pathname, url.searchParams, body)

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
