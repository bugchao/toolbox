/**
 * BrowserStorage: localStorage (small) + IndexedDB (large)
 * Fallback when server is unavailable.
 */

const DB_NAME = 'toolbox-store'
const DB_VERSION = 1
const STORE_NAME = 'kv'

let _db: IDBDatabase | null = null

async function openDB(): Promise<IDBDatabase> {
  if (_db) return _db
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE_NAME)
    }
    req.onsuccess = () => { _db = req.result; resolve(req.result) }
    req.onerror = () => reject(req.error)
  })
}

function idbKey(ns: string, key: string) {
  return `${ns}::${key}`
}

export const BrowserStorage = {
  async get<T>(ns: string, key: string): Promise<T | null> {
    // Try localStorage first (fast)
    const lsKey = `toolbox:${ns}:${key}`
    const ls = localStorage.getItem(lsKey)
    if (ls !== null) {
      try { return JSON.parse(ls) as T } catch { return null }
    }
    // Fallback to IndexedDB
    try {
      const db = await openDB()
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readonly')
        const req = tx.objectStore(STORE_NAME).get(idbKey(ns, key))
        req.onsuccess = () => resolve(req.result ?? null)
        req.onerror = () => resolve(null)
      })
    } catch { return null }
  },

  async set<T>(ns: string, key: string, value: T): Promise<void> {
    const serialized = JSON.stringify(value)
    // Small data (<100KB) → localStorage for fast sync reads
    if (serialized.length < 100 * 1024) {
      try {
        localStorage.setItem(`toolbox:${ns}:${key}`, serialized)
        return
      } catch {
        // localStorage full, fall through to IndexedDB
      }
    }
    // Large data → IndexedDB
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      tx.objectStore(STORE_NAME).put(value, idbKey(ns, key))
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  },

  async remove(ns: string, key: string): Promise<void> {
    localStorage.removeItem(`toolbox:${ns}:${key}`)
    try {
      const db = await openDB()
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readwrite')
        tx.objectStore(STORE_NAME).delete(idbKey(ns, key))
        tx.oncomplete = () => resolve()
        tx.onerror = () => resolve()
      })
    } catch { /* ignore */ }
  },

  async list(ns: string): Promise<string[]> {
    const prefix = `toolbox:${ns}:`
    const lsKeys = Object.keys(localStorage)
      .filter(k => k.startsWith(prefix))
      .map(k => k.slice(prefix.length))
    try {
      const db = await openDB()
      const idbKeys: string[] = await new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readonly')
        const req = tx.objectStore(STORE_NAME).getAllKeys()
        req.onsuccess = () => resolve(
          (req.result as string[]).filter(k => k.startsWith(`${ns}::`)).map(k => k.slice(ns.length + 2))
        )
        req.onerror = () => resolve([])
      })
      return Array.from(new Set([...lsKeys, ...idbKeys]))
    } catch { return lsKeys }
  },

  async clear(ns: string): Promise<void> {
    const prefix = `toolbox:${ns}:`
    Object.keys(localStorage).filter(k => k.startsWith(prefix)).forEach(k => localStorage.removeItem(k))
    try {
      const db = await openDB()
      const keys: IDBValidKey[] = await new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readonly')
        const req = tx.objectStore(STORE_NAME).getAllKeys()
        req.onsuccess = () => resolve((req.result as string[]).filter(k => String(k).startsWith(`${ns}::`) ))
        req.onerror = () => resolve([])
      })
      const tx = db.transaction(STORE_NAME, 'readwrite')
      keys.forEach(k => tx.objectStore(STORE_NAME).delete(k))
    } catch { /* ignore */ }
  },

  // Export all data for migration to server
  async exportAll(): Promise<Record<string, Record<string, unknown>>> {
    const result: Record<string, Record<string, unknown>> = {}
    const prefix = 'toolbox:'
    Object.entries(localStorage).forEach(([k, v]) => {
      if (!k.startsWith(prefix)) return
      const parts = k.slice(prefix.length).split(':')
      if (parts.length < 2) return
      const [ns, ...rest] = parts
      const key = rest.join(':')
      if (!result[ns]) result[ns] = {}
      try { result[ns][key] = JSON.parse(v) } catch { result[ns][key] = v }
    })
    return result
  }
}
