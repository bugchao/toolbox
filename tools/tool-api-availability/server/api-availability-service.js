import https from 'https'
import http from 'http'

function checkEndpoint({ url, method = 'GET', expectedStatus = 200 }) {
  return new Promise((resolve) => {
    const start = Date.now()
    const parsed = new URL(url)
    const isHttps = parsed.protocol === 'https:'
    const lib = isHttps ? https : http
    const options = {
      hostname: parsed.hostname,
      port: parsed.port || (isHttps ? 443 : 80),
      path: parsed.pathname + parsed.search,
      method,
      timeout: 8000,
      headers: { 'User-Agent': 'Toolbox-APICheck/1.0' },
    }
    const req = lib.request(options, (res) => {
      const latency = Date.now() - start
      const status = res.statusCode ?? 0
      const available = status === expectedStatus || (expectedStatus === 200 && status >= 200 && status < 300)
      const headers = {}
      for (const [k, v] of Object.entries(res.headers)) {
        if (['content-type', 'server', 'x-powered-by', 'cache-control'].includes(k)) {
          headers[k] = String(v)
        }
      }
      res.resume()
      resolve({ url, method, status, latency, available, headers })
    })
    req.on('error', (e) => resolve({ url, method, status: null, latency: null, available: false, error: e.message }))
    req.on('timeout', () => { req.destroy(); resolve({ url, method, status: null, latency: null, available: false, error: 'timeout' }) })
    req.end()
  })
}

export async function checkApiAvailability(endpoints) {
  const results = await Promise.all(endpoints.map(e => checkEndpoint(e)))
  return { results }
}
