/**
 * useToolStorage: React hook for tool-level persistent storage.
 * 
 * Server-only mode: Fails gracefully when server is unavailable.
 * 
 * Usage:
 *   const { data, save, loading, error, backend } = useToolStorage<MyData>(
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
  error: string | null
  backend: StorageBackend | null
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
  const [error, setError] = useState<string | null>(null)
  const [backend, setBackend] = useState<StorageBackend | null>(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    let cancelled = false

    const load = async () => {
      try {
        setError(null)
        const stored = await StorageAdapter.get<T>(namespace, key)
        if (!cancelled && mountedRef.current) {
          if (stored !== null) setData(stored)
          setBackend(StorageAdapter.backend)
          setLoading(false)
        }
      } catch (err) {
        if (!cancelled && mountedRef.current) {
          setError(err instanceof Error ? err.message : 'Storage unavailable')
          setBackend(StorageAdapter.backend)
          setLoading(false)
        }
      }
    }

    load()
    return () => {
      cancelled = true
      mountedRef.current = false
    }
  }, [namespace, key])

  const save = useCallback(async (value: T) => {
    try {
      setError(null)
      setData(value)
      await StorageAdapter.set(namespace, key, value)
      setBackend(StorageAdapter.backend)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
      throw err
    }
  }, [namespace, key])

  const remove = useCallback(async () => {
    try {
      setError(null)
      await StorageAdapter.remove(namespace, key)
      setData(defaultValue)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove')
      throw err
    }
  }, [namespace, key, defaultValue])

  const listKeys = useCallback(async () => {
    await ensureServer()
    return StorageAdapter.list(namespace)
  }, [namespace])

  const getKey = useCallback(async <V>(k: string, def: V): Promise<V> => {
    await ensureServer()
    const v = await StorageAdapter.get<V>(namespace, k)
    return v ?? def
  }, [namespace])

  const setKey = useCallback(async <V>(k: string, value: V) => {
    await ensureServer()
    await StorageAdapter.set(namespace, k, value)
  }, [namespace])

  return { data, save, remove, loading, error, backend, listKeys, getKey, setKey }
}

async function ensureServer() {
  const b = await (StorageAdapter as any).detectBackend?.() ?? StorageAdapter.backend
  if (b !== 'server') {
    throw new Error('服务端不可用，请确保后端服务已启动')
  }
}
