/**
 * StorageAdapter: Browser-only storage mode.
 * 
 * Uses localStorage (<100KB) or IndexedDB (larger data).
 * No server dependency — data persists across page refreshes.
 * 
 * Note: Data is device-specific and does not sync across devices.
 */

import { BrowserStorage } from './BrowserStorage'

export type StorageBackend = 'browser'

export const StorageAdapter = {
  /** Always returns 'browser' in this mode */
  get backend(): StorageBackend { return 'browser' },

  async get<T>(ns: string, key: string): Promise<T | null> {
    return BrowserStorage.get<T>(ns, key)
  },

  async set<T>(ns: string, key: string, value: T): Promise<void> {
    return BrowserStorage.set(ns, key, value)
  },

  async remove(ns: string, key: string): Promise<void> {
    return BrowserStorage.remove(ns, key)
  },

  async list(ns: string): Promise<string[]> {
    return BrowserStorage.list(ns)
  },

  async clear(ns: string): Promise<void> {
    return BrowserStorage.clear(ns)
  },

  /** No-op in browser-only mode */
  async redetect(): Promise<StorageBackend> {
    return 'browser'
  },

  /** No-op in browser-only mode */
  async migrateFromBrowser(): Promise<{ migrated: number; errors: number }> {
    return { migrated: 0, errors: 0 }
  },
}
