/**
 * useToolStorage: React hook for tool-level persistent storage.
 *
 * Usage:
 *   const { data, save, remove, loading, backend } = useToolStorage<MyData>(
 *     'habit-tracker', 'habits', defaultValue
 *   )
 *
 * - Automatically loads on mount
 * - save(newData) persists and updates local state
 * - remove() deletes and resets to defaultValue
 * - backend: 'server' | 'browser' | null
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { StorageAdapter, StorageBackend } from './StorageAdapter'

export interface ToolStorageResult<T> {
  data: T
  save: (value: T) => Promise<void>
  remove: () => Promise<void>
  loading: boolean
  backend: StorageBackend | null
  /** List all keys in this namespace */
  listKeys: () => Promise<string[]>
  /** Get a specific key (for multi-key use) */
  getKey: <V>(key: string, def: V) => Promise<V>
  /** Set a specific key (for multi-key use) */
  setKey: <V>(key: string, value: V) => Promise<void>
}

export function useToolStorage<T>(
  namespace: string,
  key: string,
  defaultValue: T
): ToolStorageResult<T> {
  const [data, setData] = useState<T>(defaultValue)
  const [loading, setLoading] = useState(true)
  const [backend, setBackend] = useState<StorageBackend | null>(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    let cancelled = false

    const load = async () => {
      try {
        const stored = await StorageAdapter.get<T>(namespace, key)
        if (!cancelled && mountedRef.current) {
          if (stored !== null) setData(stored)
          setBackend(StorageAdapter.backend)
          setLoading(false)
        }
      } catch {
        if (!cancelled && mountedRef.current) setLoading(false)
      }
    }

    load()
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
  }, [namespace, key, defaultValue])

  const listKeys = useCallback(() => StorageAdapter.list(namespace), [namespace])

  const getKey = useCallback(async <V>(k: string, def: V): Promise<V> => {
    const v = await StorageAdapter.get<V>(namespace, k)
    return v ?? def
  }, [namespace])

  const setKey = useCallback(async <V>(k: string, value: V) => {
    await StorageAdapter.set(namespace, k, value)
  }, [namespace])

  return { data, save, remove, loading, backend, listKeys, getKey, setKey }
}
