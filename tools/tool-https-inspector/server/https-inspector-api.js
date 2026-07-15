import { inspectHttps } from './https-inspector-service.js';

const ROUTE = '/api/https-inspector/check';

export function registerHttpsInspectorApiRoutes(app) {
  app.post(ROUTE, async (req, res) => {
    try {
      const { domain, port } = req.body || {};
      if (!domain) return res.status(400).json({ error: 'Domain is required' });
      const result = await inspectHttps(domain, Number(port) || 443);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message || 'Request failed' });
    }
  });
}

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  if (typeof res.setHeader === 'function') {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
  }
  res.end(JSON.stringify(payload));
}

async function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
}

export function createHttpsInspectorApiMiddleware() {
  return async (req, res, next) => {
    try {
      const url = new URL(req.url ?? '', 'http://localhost');
      if (url.pathname !== ROUTE) {
        next();
        return;
      }
      if ((req.method ?? 'GET') !== 'POST') {
        sendJson(res, 405, { error: 'Method not allowed' });
        return;
      }

      const body = await readJsonBody(req);
      if (!body?.domain) {
        sendJson(res, 400, { error: 'Domain is required' });
        return;
      }

      const result = await inspectHttps(body.domain, Number(body.port) || 443);
      sendJson(res, 200, result);
    } catch (error) {
      sendJson(res, 400, { error: error.message || 'Request failed' });
    }
  };
}
