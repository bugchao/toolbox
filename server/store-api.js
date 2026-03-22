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

let db = null

async function getDb() {
  if (db) return db
  try {
    // Dynamic import to avoid hard dependency
    const { default: Database } = await import('better-sqlite3')
    const dbPath = process.env.STORE_DB_PATH || path.join(__dirname, '..', 'toolbox-store.db')
    db = new Database(dbPath)
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
    console.log('[store-api] SQLite ready:', dbPath)
    return db
  } catch (err) {
    console.warn('[store-api] SQLite unavailable, store API disabled:', err.message)
    return null
  }
}

export async function registerStoreApiRoutes(app) {
  // Pre-init DB (non-blocking, failures are graceful)
  await getDb().catch(() => null)

  // Helper: get db or respond 503
  async function withDb(req, res, fn) {
    const d = await getDb()
    if (!d) return res.status(503).json({ error: 'Storage backend unavailable (better-sqlite3 not installed)' })
    try { fn(d) } catch (err) {
      console.error('[store-api] error:', err)
      res.status(500).json({ error: err.message })
    }
  }

  // Validate namespace / key (alphanumeric, dash, underscore)
  function valid(s) { return /^[a-zA-Z0-9_-]{1,64}$/.test(s) }

  // GET /api/store/ping
  app.get('/api/store/ping', (req, res) => {
    res.json({ ok: true, backend: 'sqlite', time: Date.now() })
  })

  // GET /api/store/:ns
  app.get('/api/store/:ns', async (req, res) => {
    const { ns } = req.params
    if (!valid(ns)) return res.status(400).json({ error: 'Invalid namespace' })
    await withDb(req, res, (db) => {
      const rows = db.prepare('SELECT key FROM kv_store WHERE ns = ?').all(ns)
      res.json({ keys: rows.map(r => r.key) })
    })
  })

  // DELETE /api/store/:ns
  app.delete('/api/store/:ns', async (req, res) => {
    const { ns } = req.params
    if (!valid(ns)) return res.status(400).json({ error: 'Invalid namespace' })
    await withDb(req, res, (db) => {
      const info = db.prepare('DELETE FROM kv_store WHERE ns = ?').run(ns)
      res.json({ deleted: info.changes })
    })
  })

  // GET /api/store/:ns/:key
  app.get('/api/store/:ns/:key', async (req, res) => {
    const { ns, key } = req.params
    if (!valid(ns) || !valid(key)) return res.status(400).json({ error: 'Invalid namespace or key' })
    await withDb(req, res, (db) => {
      const row = db.prepare('SELECT value FROM kv_store WHERE ns = ? AND key = ?').get(ns, key)
      if (!row) return res.status(404).json({ error: 'Not found' })
      try {
        res.json({ value: JSON.parse(row.value) })
      } catch {
        res.json({ value: row.value })
      }
    })
  })

  // PUT /api/store/:ns/:key
  app.put('/api/store/:ns/:key', async (req, res) => {
    const { ns, key } = req.params
    if (!valid(ns) || !valid(key)) return res.status(400).json({ error: 'Invalid namespace or key' })
    const { value } = req.body
    if (value === undefined) return res.status(400).json({ error: 'Missing value in body' })
    await withDb(req, res, (db) => {
      db.prepare(`
        INSERT INTO kv_store (ns, key, value, updated_at)
        VALUES (?, ?, ?, unixepoch())
        ON CONFLICT(ns, key) DO UPDATE SET value = excluded.value, updated_at = unixepoch()
      `).run(ns, key, JSON.stringify(value))
      res.json({ ok: true })
    })
  })

  // DELETE /api/store/:ns/:key
  app.delete('/api/store/:ns/:key', async (req, res) => {
    const { ns, key } = req.params
    if (!valid(ns) || !valid(key)) return res.status(400).json({ error: 'Invalid namespace or key' })
    await withDb(req, res, (db) => {
      const info = db.prepare('DELETE FROM kv_store WHERE ns = ? AND key = ?').run(ns, key)
      res.json({ deleted: info.changes })
    })
  })
}
