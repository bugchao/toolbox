import { useEffect, useMemo, useState } from 'react'
import type { InventoryPool } from './types'

const STORAGE_KEY = 'toolbox-ipam-inventory'

function loadInventory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as InventoryPool[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function persistInventory(items: InventoryPool[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // Ignore quota/privacy failures.
  }
}

export function useIpamInventoryStore() {
  const [items, setItems] = useState<InventoryPool[]>(() => loadInventory())

  useEffect(() => {
    const handler = () => setItems(loadInventory())
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  const api = useMemo(
    () => ({
      items,
      addPool(payload: Omit<InventoryPool, 'id' | 'createdAt' | 'updatedAt'>) {
        setItems((prev) => {
          const next: InventoryPool[] = [
            {
              ...payload,
              id: crypto.randomUUID(),
              createdAt: Date.now(),
              updatedAt: Date.now(),
            },
            ...prev,
          ]
          persistInventory(next)
          return next
        })
      },
      updatePool(id: string, patch: Partial<Omit<InventoryPool, 'id' | 'createdAt'>>) {
        setItems((prev) => {
          const next = prev.map((item) =>
            item.id === id
              ? {
                  ...item,
                  ...patch,
                  updatedAt: Date.now(),
                }
              : item
          )
          persistInventory(next)
          return next
        })
      },
      removePool(id: string) {
        setItems((prev) => {
          const next = prev.filter((item) => item.id !== id)
          persistInventory(next)
          return next
        })
      },
      clearAll() {
        setItems([])
        persistInventory([])
      },
      importPools(payloads: Array<Omit<InventoryPool, 'id' | 'createdAt' | 'updatedAt'>>, mode: 'append' | 'replace' = 'append') {
        setItems((prev) => {
          const imported = payloads.map((payload) => ({
            ...payload,
            id: crypto.randomUUID(),
            createdAt: Date.now(),
            updatedAt: Date.now(),
          }))
          const next = mode === 'replace' ? imported : [...imported, ...prev]
          persistInventory(next)
          return next
        })
      },
    }),
    [items]
  )

  return api
}
