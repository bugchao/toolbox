/**
 * StorageAdapter: auto-detects server availability.
 * 
 * Server-only mode: All data is stored on the server.
 * If server is unavailable, operations fail gracefully with clear errors.
 * No fallback to browser storage — ensures data consistency across devices.
 */

import { BrowserStorage } from './BrowserStorage'
import { ServerStorage } from './ServerStorage'

export type StorageBackend = 'server' | 'offline'

let _backend: StorageBackend | null = null
let _detectPromise: Promise<StorageBackend> | null = null

async function detectBackend(): Promise<StorageBackend> {
  if (_backend) return _backend
  if (_detectPromise) return _detectPromise

  _detectPromise = (async () => {
    const BASE = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_URL) || '/api'
    try {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), 2000)
      const res = await fetch(`${BASE}/store/ping`, { signal: controller.signal })
      clearTimeout(timer)
      if (res.ok) {
        try {
          const body = await res.json()
          if (body?.ok === true) {
            _backend = 'server'
            return _backend
          }
        } catch {}
      }
    } catch {}
    _backend = 'offline'
    return _backend
  })()

  return _detectPromise
}

// Pre-warm detection on import (non-blocking)
detectBackend().catch(() => {})

async function ensureServer(): Promise<void> {
  const b = await detectBackend()
  if (b !== 'server') {
    throw new Error('Storage server unavailable. Please ensure the backend is running.')
  }
}

export const StorageAdapter = {
  /** Returns current backend ('server' | 'offline' | null if still detecting) */
  get backend(): StorageBackend | null { return _backend },

  /** Force re-detection (e.g. after server restart) */
  async redetect(): Promise<StorageBackend> {
    _backend = null
    _detectPromise = null
    return detectBackend()
  },

  async get<T>(ns: string, key: string): Promise<T | null> {
    await ensureServer()
    return ServerStorage.get<T>(ns, key)
  },

  async set<T>(ns: string, key: string, value: T): Promise<void> {
    await ensureServer()
    await ServerStorage.set(ns, key, value)
  },

  async remove(ns: string, key: string): Promise<void> {
    await ensureServer()
    await ServerStorage.remove(ns, key)
  },

  async list(ns: string): Promise<string[]> {
    await ensureServer()
    return ServerStorage.list(ns)
  },

  async clear(ns: string): Promise<void> {
    await ensureServer()
    await ServerStorage.clear(ns)
  },

  /**
   * Migrate browser storage data to server (for users switching from offline mode).
   */
  async migrateFromBrowser(): Promise<{ migrated: number; errors: number }> {
    await ensureServer()
    const all = await BrowserStorage.exportAll()
    let migrated = 0, errors = 0
    for (const [ns, kvs] of Object.entries(all)) {
      for (const [key, value] of Object.entries(kvs)) {
        try {
          await ServerStorage.set(ns, key, value)
          migrated++
        } catch {
          errors++
        }
      }
    }
    return { migrated, errors }
  },
}
