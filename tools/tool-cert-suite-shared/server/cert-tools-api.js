import { convertCertificateFormat, inspectCertificate, inspectCsr } from './cert-toolkit.js'

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
    case '/api/cert-tools/csr-inspect':
      return { statusCode: 200, payload: await inspectCsr(body.content) }
    case '/api/cert-tools/cert-inspect':
      return {
        statusCode: 200,
        payload: await inspectCertificate({
          content: body.content,
          encoding: body.encoding,
        }),
      }
    case '/api/cert-tools/convert':
      return { statusCode: 200, payload: await convertCertificateFormat(body) }
    default:
      return null
  }
}

function handleError(res, error) {
  res.status(400).json({ error: error.message || 'Request failed' })
}

export function registerCertToolsApiRoutes(app) {
  app.post('/api/cert-tools/csr-inspect', async (req, res) => {
    try {
      res.json(await inspectCsr(req.body?.content))
    } catch (error) {
      handleError(res, error)
    }
  })

  app.post('/api/cert-tools/cert-inspect', async (req, res) => {
    try {
      res.json(
        await inspectCertificate({
          content: req.body?.content,
          encoding: req.body?.encoding,
        })
      )
    } catch (error) {
      handleError(res, error)
    }
  })

  app.post('/api/cert-tools/convert', async (req, res) => {
    try {
      res.json(await convertCertificateFormat(req.body || {}))
    } catch (error) {
      handleError(res, error)
    }
  })
}

export function createCertToolsApiMiddleware() {
  return async (req, res, next) => {
    try {
      const url = new URL(req.url ?? '', 'http://localhost')
      if (!url.pathname.startsWith('/api/cert-tools/')) {
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
