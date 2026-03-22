/**
 * useToolStorage: React hook for dual-mode persistent storage.
 * 
 * Default: Browser storage (works without server)
 * Optional: Can switch to server storage for cross-device sync
 * 
 * Usage:
 *   const { data, save, loading, backend, switchToServer, migrate } = useToolStorage<MyData>(
 *     'habit-tracker', 'data', defaultValue
 *   )
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { StorageAdapter, StorageBackend } from './StorageAdapter'

export interface ToolStorageResult<T> {
  data: T
  save: (value: T) => Promise<void>
  remove: () => Promise<void>
  loading: boolean
  backend: StorageBackend
  serverAvailable: boolean
  switchToServer: () => Promise<boolean>
  switchToBrowser: () => void
  migrateToServer: () => Promise<{ migrated: number; errors: number }>
  listKeys: () => Promise<string[]>
  getKey: <V>(key: string, def: V) => Promise<V>
  setKey: <V>(key: string, value: V) => Promise<void>
}

export function useToolStorage<T>(
  namespace: string,
  key: string,
  defaultValue: T
): ToolStorageResult<T> {
  const [data, setData] = useState<T>(defaultValue)
  const [loading, setLoading] = useState(true)
  const [backend, setBackend] = useState<StorageBackend>(StorageAdapter.backend)
  const [serverAvailable, setServerAvailable] = useState(false)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    let cancelled = false

    const init = async () => {
      try {
        const [stored, isServerAvail] = await Promise.all([
          StorageAdapter.get<T>(namespace, key),
          StorageAdapter.isServerAvailable()
        ])
        if (!cancelled && mountedRef.current) {
          if (stored !== null) setData(stored)
          setBackend(StorageAdapter.backend)
          setServerAvailable(isServerAvail)
          setLoading(false)
        }
      } catch {
        if (!cancelled && mountedRef.current) {
          setServerAvailable(false)
          setLoading(false)
        }
      }
    }

    init()
    return () => {
      cancelled = true
      mountedRef.current = false
    }
  }, [namespace, key])

  const save = useCallback(async (value: T) => {
    setData(value)
    await StorageAdapter.set(namespace, key, value)
    setBackend(StorageAdapter.backend)
  }, [namespace, key])

  const remove = useCallback(async () => {
    await StorageAdapter.remove(namespace, key)
    setData(defaultValue)
    setBackend(StorageAdapter.backend)
  }, [namespace, key, defaultValue])

  const switchToServer = useCallback(async () => {
    const ok = await StorageAdapter.useServer()
    if (ok) {
      setBackend('server')
      // Auto-migrate after switching
      await StorageAdapter.migrateToServer()
    }
    return ok
  }, [])

  const switchToBrowser = useCallback(() => {
    StorageAdapter.useBrowser()
    setBackend('browser')
  }, [])

  const migrateToServer = useCallback(async () => {
    const result = await StorageAdapter.migrateToServer()
    if (result.migrated > 0) setBackend('server')
    return result
  }, [])

  const listKeys = useCallback(() => StorageAdapter.list(namespace), [namespace])

  const getKey = useCallback(async <V>(k: string, def: V): Promise<V> => {
    const v = await StorageAdapter.get<V>(namespace, k)
    return v ?? def
  }, [namespace])

  const setKey = useCallback(async <V>(k: string, value: V) => {
    await StorageAdapter.set(namespace, k, value)
  }, [namespace])

  return {
    data,
    save,
    remove,
    loading,
    backend,
    serverAvailable,
    switchToServer,
    switchToBrowser,
    migrateToServer,
    listKeys,
    getKey,
    setKey,
  }
}
