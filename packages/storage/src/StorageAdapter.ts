/**
 * StorageAdapter: Dual-mode storage with browser-first strategy.
 * 
 * Default: Uses browser storage (localStorage/IndexedDB) for all operations.
 * Optional: Can migrate to server storage when backend is available.
 * 
 * Design goals:
 * - Works out-of-the-box without server dependency
 * - Server storage is opt-in for cross-device sync
 * - Clear UI indication of current storage mode
 */

import { BrowserStorage } from './BrowserStorage'
import { ServerStorage } from './ServerStorage'

export type StorageBackend = 'browser' | 'server'

let _backend: StorageBackend = 'browser' // Default to browser
let _serverAvailable: boolean | null = null

async function checkServer(): Promise<boolean> {
  if (_serverAvailable !== null) return _serverAvailable
  try {
    const BASE = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_URL) || '/api'
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 1500)
    const res = await fetch(`${BASE}/store/ping`, { signal: controller.signal })
    clearTimeout(timer)
    if (res.ok) {
      try {
        const body = await res.json()
        _serverAvailable = body?.ok === true
        return _serverAvailable
      } catch {}
    }
  } catch {}
  _serverAvailable = false
  return false
}

// Pre-warm server check (non-blocking)
checkServer().catch(() => {})

export const StorageAdapter = {
  /** Returns current backend ('browser' or 'server') */
  get backend(): StorageBackend { return _backend },

  /** Check if server is available */
  async isServerAvailable(): Promise<boolean> {
    return checkServer()
  },

  /** Switch to server mode (will fail if server unavailable) */
  async useServer(): Promise<boolean> {
    const available = await checkServer()
    if (available) {
      _backend = 'server'
      return true
    }
    return false
  },

  /** Switch back to browser mode */
  useBrowser(): void {
    _backend = 'browser'
  },

  /** Get data from current backend */
  async get<T>(ns: string, key: string): Promise<T | null> {
    if (_backend === 'server' && _serverAvailable) {
      try {
        const v = await ServerStorage.get<T>(ns, key)
        if (v !== null) return v
        // Fallback to browser if server has no data
        return BrowserStorage.get<T>(ns, key)
      } catch {
        _backend = 'browser'
        return BrowserStorage.get<T>(ns, key)
      }
    }
    return BrowserStorage.get<T>(ns, key)
  },

  /** Save to current backend */
  async set<T>(ns: string, key: string, value: T): Promise<void> {
    if (_backend === 'server' && _serverAvailable) {
      try {
        await ServerStorage.set(ns, key, value)
        return
      } catch {
        _backend = 'browser'
      }
    }
    await BrowserStorage.set(ns, key, value)
  },

  async remove(ns: string, key: string): Promise<void> {
    if (_backend === 'server' && _serverAvailable) {
      try {
        await ServerStorage.remove(ns, key)
      } catch {
        _backend = 'browser'
      }
    }
    await BrowserStorage.remove(ns, key)
  },

  async list(ns: string): Promise<string[]> {
    if (_backend === 'server' && _serverAvailable) {
      try {
        return await ServerStorage.list(ns)
      } catch {
        _backend = 'browser'
      }
    }
    return BrowserStorage.list(ns)
  },

  async clear(ns: string): Promise<void> {
    if (_backend === 'server' && _serverAvailable) {
      try {
        await ServerStorage.clear(ns)
      } catch {
        _backend = 'browser'
      }
    }
    await BrowserStorage.clear(ns)
  },

  /** Migrate browser data to server */
  async migrateToServer(): Promise<{ migrated: number; errors: number }> {
    const available = await checkServer()
    if (!available) return { migrated: 0, errors: 1 }
    
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
    if (migrated > 0) _backend = 'server'
    return { migrated, errors }
  },
}
