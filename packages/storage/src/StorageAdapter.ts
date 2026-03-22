/**
 * StorageAdapter: auto-detects server availability and routes to
 * ServerStorage or BrowserStorage accordingly.
 *
 * Detection is done once per session with a 1.5s timeout ping.
 * Result is cached for the lifetime of the page.
 */

import { BrowserStorage } from './BrowserStorage'
import { ServerStorage } from './ServerStorage'

export type StorageBackend = 'server' | 'browser'

let _backend: StorageBackend | null = null
let _detecting = false
let _detectPromise: Promise<StorageBackend> | null = null

async function detectBackend(): Promise<StorageBackend> {
  if (_backend) return _backend
  if (_detectPromise) return _detectPromise

  _detecting = true
  _detectPromise = (async () => {
    const BASE = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_URL) || '/api'
    try {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), 1500)
      const res = await fetch(`${BASE}/store/ping`, { signal: controller.signal })
      clearTimeout(timer)
      _backend = res.ok ? 'server' : 'browser'
    } catch {
      _backend = 'browser'
    }
    _detecting = false
    return _backend
  })()

  return _detectPromise
}

// Pre-warm detection on import (non-blocking)
detectBackend().catch(() => {})

async function getBackend() {
  const b = await detectBackend()
  return b === 'server' ? ServerStorage : BrowserStorage
}

export const StorageAdapter = {
  /** Returns current backend ('server' | 'browser' | null if still detecting) */
  get backend(): StorageBackend | null { return _backend },

  /** Force re-detection (e.g. after server comes online) */
  async redetect(): Promise<StorageBackend> {
    _backend = null
    _detectPromise = null
    return detectBackend()
  },

  async get<T>(ns: string, key: string): Promise<T | null> {
    return (await getBackend()).get<T>(ns, key)
  },

  async set<T>(ns: string, key: string, value: T): Promise<void> {
    return (await getBackend()).set<T>(ns, key, value)
  },

  async remove(ns: string, key: string): Promise<void> {
    return (await getBackend()).remove(ns, key)
  },

  async list(ns: string): Promise<string[]> {
    return (await getBackend()).list(ns)
  },

  async clear(ns: string): Promise<void> {
    return (await getBackend()).clear(ns)
  },

  /**
   * Migrate all browser storage data to server.
   * Call after server becomes available for the first time.
   */
  async migrateToServer(): Promise<{ migrated: number; errors: number }> {
    const all = await BrowserStorage.exportAll()
    let migrated = 0, errors = 0
    for (const [ns, kvs] of Object.entries(all)) {
      for (const [key, value] of Object.entries(kvs)) {
        try {
          await ServerStorage.set(ns, key, value)
          await BrowserStorage.remove(ns, key)
          migrated++
        } catch {
          errors++
        }
      }
    }
    // After migration, switch to server
    _backend = 'server'
    return { migrated, errors }
  },
}
