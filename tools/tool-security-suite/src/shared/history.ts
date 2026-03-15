import { useMemo, useState } from 'react'
import type { RiskLevel } from './types'

export interface HistoryEntry<TPayload> {
  id: string
  createdAt: number
  title: string
  subtitle?: string
  score?: number
  level?: RiskLevel
  payload: TPayload
}

function loadEntries<TPayload>(storageKey: string): HistoryEntry<TPayload>[] {
  try {
    const raw = localStorage.getItem(storageKey)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed as HistoryEntry<TPayload>[]
  } catch {
    return []
  }
}

function persistEntries<TPayload>(storageKey: string, entries: HistoryEntry<TPayload>[]) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(entries))
  } catch {
    // Ignore storage quota and privacy mode failures.
  }
}

export function useLocalHistory<TPayload>(storageKey: string, limit = 10) {
  const [entries, setEntries] = useState<HistoryEntry<TPayload>[]>(() => loadEntries<TPayload>(storageKey))

  const api = useMemo(
    () => ({
      entries,
      save(entry: Omit<HistoryEntry<TPayload>, 'id' | 'createdAt'>, dedupeKey?: (payload: TPayload) => string) {
        setEntries((prev) => {
          const nextEntry: HistoryEntry<TPayload> = {
            ...entry,
            id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
            createdAt: Date.now(),
          }

          const next = dedupeKey
            ? [nextEntry, ...prev.filter((item) => dedupeKey(item.payload) !== dedupeKey(entry.payload))]
            : [nextEntry, ...prev]

          const limited = next.slice(0, limit)
          persistEntries(storageKey, limited)
          return limited
        })
      },
      remove(id: string) {
        setEntries((prev) => {
          const next = prev.filter((item) => item.id !== id)
          persistEntries(storageKey, next)
          return next
        })
      },
      clear() {
        setEntries([])
        persistEntries(storageKey, [])
      },
    }),
    [entries, limit, storageKey]
  )

  return api
}
