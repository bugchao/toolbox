/**
 * Vite dev server middleware for store API
 * Uses in-memory store (no SQLite needed for dev)
 * Production uses store-api.js with SQLite
 */

// In-memory KV store for dev
const memStore = new Map() // key: `${ns}::${key}` -> value

function valid(s) {
  return s && /^[a-zA-Z0-9_-]{1,64}$/.test(s)
}

export function createStoreMiddleware() {
  return function storeMiddleware(req, res, next) {
    const url = req.url?.split('?')[0]
    if (!url?.startsWith('/api/store')) return next()

    // Parse body for PUT
    const getBody = () => new Promise((resolve) => {
      if (req.method !== 'PUT' && req.method !== 'POST') return resolve({})
      let data = ''
      req.on('data', chunk => { data += chunk })
      req.on('end', () => {
        try { resolve(JSON.parse(data)) } catch { resolve({}) }
      })
    })

    const send = (status, body) => {
      res.writeHead(status, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify(body))
    }

    const parts = url.replace('/api/store', '').split('/').filter(Boolean)
    // parts: [] | ['ping'] | [ns] | [ns, key]

    ;(async () => {
      // GET /api/store/ping
      if (parts[0] === 'ping') {
        return send(200, { ok: true, backend: 'memory-dev', time: Date.now() })
      }

      const ns = parts[0]
      const key = parts[1]

      if (ns && !valid(ns)) return send(400, { error: 'Invalid namespace' })
      if (key && !valid(key)) return send(400, { error: 'Invalid key' })

      // GET /api/store/:ns
      if (req.method === 'GET' && ns && !key) {
        const keys = []
        for (const k of memStore.keys()) {
          if (k.startsWith(`${ns}::`)) keys.push(k.slice(ns.length + 2))
        }
        return send(200, { keys })
      }

      // DELETE /api/store/:ns
      if (req.method === 'DELETE' && ns && !key) {
        let deleted = 0
        for (const k of [...memStore.keys()]) {
          if (k.startsWith(`${ns}::`)) { memStore.delete(k); deleted++ }
        }
        return send(200, { deleted })
      }

      // GET /api/store/:ns/:key
      if (req.method === 'GET' && ns && key) {
        const val = memStore.get(`${ns}::${key}`)
        if (val === undefined) return send(404, { error: 'Not found' })
        return send(200, { value: val })
      }

      // PUT /api/store/:ns/:key
      if (req.method === 'PUT' && ns && key) {
        const body = await getBody()
        if (body.value === undefined) return send(400, { error: 'Missing value' })
        memStore.set(`${ns}::${key}`, body.value)
        return send(200, { ok: true })
      }

      // DELETE /api/store/:ns/:key
      if (req.method === 'DELETE' && ns && key) {
        const existed = memStore.has(`${ns}::${key}`)
        memStore.delete(`${ns}::${key}`)
        return send(200, { deleted: existed ? 1 : 0 })
      }

      next()
    })()
  }
}
