/**
 * 通用键值存储 API
 * 使用 SQLite (better-sqlite3) 持久化工具数据
 *
 * Routes:
 *   GET    /api/store/ping           健康检测
 *   GET    /api/store/:ns            列出 namespace 下所有 key
 *   DELETE /api/store/:ns            清空 namespace
 *   GET    /api/store/:ns/:key       读取值
 *   PUT    /api/store/:ns/:key       写入值
 *   DELETE /api/store/:ns/:key       删除值
 */

import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let store = null
let backendName = 'uninitialized'

function ensureParentDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
}

function createJsonFileStore(filePath) {
  ensureParentDir(filePath)

  const readState = () => {
    if (!fs.existsSync(filePath)) return {}
    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    } catch {
      return {}
    }
  }

  const writeState = (state) => {
    fs.writeFileSync(filePath, JSON.stringify(state, null, 2), 'utf-8')
  }

  return {
    kind: 'json-file',
    list(ns) {
      const state = readState()
      return Object.keys(state[ns] || {})
    },
    get(ns, key) {
      const state = readState()
      return state[ns]?.[key]
    },
    set(ns, key, value) {
      const state = readState()
      state[ns] ||= {}
      state[ns][key] = value
      writeState(state)
    },
    remove(ns, key) {
      const state = readState()
      const existed = Object.prototype.hasOwnProperty.call(state[ns] || {}, key)
      if (!existed) return 0
      delete state[ns][key]
      if (state[ns] && Object.keys(state[ns]).length === 0) delete state[ns]
      writeState(state)
      return 1
    },
    clear(ns) {
      const state = readState()
      const deleted = Object.keys(state[ns] || {}).length
      if (deleted) {
        delete state[ns]
        writeState(state)
      }
      return deleted
    },
  }
}

async function getStore() {
  if (store) return store
  try {
    const { default: Database } = await import('better-sqlite3')
    const dbPath = process.env.STORE_DB_PATH || path.join(__dirname, '..', 'toolbox-store.db')
    const db = new Database(dbPath)
    db.exec(`
      CREATE TABLE IF NOT EXISTS kv_store (
        ns         TEXT NOT NULL,
        key        TEXT NOT NULL,
        value      TEXT NOT NULL,
        updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
        PRIMARY KEY (ns, key)
      );
      CREATE INDEX IF NOT EXISTS idx_kv_ns ON kv_store(ns);
    `)
    backendName = 'sqlite'
    store = {
      kind: 'sqlite',
      list(ns) {
        const rows = db.prepare('SELECT key FROM kv_store WHERE ns = ?').all(ns)
        return rows.map((row) => row.key)
      },
      get(ns, key) {
        const row = db.prepare('SELECT value FROM kv_store WHERE ns = ? AND key = ?').get(ns, key)
        if (!row) return undefined
        return JSON.parse(row.value)
      },
      set(ns, key, value) {
        db.prepare(`
          INSERT INTO kv_store (ns, key, value, updated_at)
          VALUES (?, ?, ?, unixepoch())
          ON CONFLICT(ns, key) DO UPDATE SET value = excluded.value, updated_at = unixepoch()
        `).run(ns, key, JSON.stringify(value))
      },
      remove(ns, key) {
        const info = db.prepare('DELETE FROM kv_store WHERE ns = ? AND key = ?').run(ns, key)
        return info.changes
      },
      clear(ns) {
        const info = db.prepare('DELETE FROM kv_store WHERE ns = ?').run(ns)
        return info.changes
      },
    }
    console.log('[store-api] SQLite ready:', dbPath)
    return store
  } catch (err) {
    const filePath = process.env.STORE_JSON_PATH || path.join(__dirname, '..', 'toolbox-store.json')
    backendName = 'json-file'
    store = createJsonFileStore(filePath)
    console.log('[store-api] using JSON file backend:', filePath)
    return store
  }
}

export async function registerStoreApiRoutes(app) {
  await getStore().catch(() => null)

  async function withStore(res, fn) {
    const activeStore = await getStore()
    if (!activeStore) {
      return res.status(503).json({ error: 'Storage backend unavailable' })
    }
    try { fn(activeStore) } catch (err) {
      console.error('[store-api] error:', err)
      res.status(500).json({ error: err.message })
    }
  }

  // Validate namespace / key (alphanumeric, dash, underscore)
  function valid(s) { return /^[a-zA-Z0-9_-]{1,64}$/.test(s) }

  // GET /api/store/ping
  app.get('/api/store/ping', (req, res) => {
    res.json({ ok: true, backend: backendName, time: Date.now() })
  })

  // GET /api/store/:ns
  app.get('/api/store/:ns', async (req, res) => {
    const { ns } = req.params
    if (!valid(ns)) return res.status(400).json({ error: 'Invalid namespace' })
    await withStore(res, (activeStore) => {
      res.json({ keys: activeStore.list(ns) })
    })
  })

  // DELETE /api/store/:ns
  app.delete('/api/store/:ns', async (req, res) => {
    const { ns } = req.params
    if (!valid(ns)) return res.status(400).json({ error: 'Invalid namespace' })
    await withStore(res, (activeStore) => {
      res.json({ deleted: activeStore.clear(ns) })
    })
  })

  // GET /api/store/:ns/:key
  app.get('/api/store/:ns/:key', async (req, res) => {
    const { ns, key } = req.params
    if (!valid(ns) || !valid(key)) return res.status(400).json({ error: 'Invalid namespace or key' })
    await withStore(res, (activeStore) => {
      const value = activeStore.get(ns, key)
      if (value === undefined) return res.status(404).json({ error: 'Not found' })
      res.json({ value })
    })
  })

  // PUT /api/store/:ns/:key
  app.put('/api/store/:ns/:key', async (req, res) => {
    const { ns, key } = req.params
    if (!valid(ns) || !valid(key)) return res.status(400).json({ error: 'Invalid namespace or key' })
    const { value } = req.body
    if (value === undefined) return res.status(400).json({ error: 'Missing value in body' })
    await withStore(res, (activeStore) => {
      activeStore.set(ns, key, value)
      res.json({ ok: true })
    })
  })

  // DELETE /api/store/:ns/:key
  app.delete('/api/store/:ns/:key', async (req, res) => {
    const { ns, key } = req.params
    if (!valid(ns) || !valid(key)) return res.status(400).json({ error: 'Invalid namespace or key' })
    await withStore(res, (activeStore) => {
      res.json({ deleted: activeStore.remove(ns, key) })
    })
  })
}
