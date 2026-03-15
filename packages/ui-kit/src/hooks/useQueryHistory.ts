import { useState, useEffect, useCallback } from 'react'

export interface QueryHistoryRecord<T> {
  id: string
  timestamp: number
  queryInfo: any // Information to re-populate the form (e.g., domain, type, ip)
  result?: T     // Optional cached result
}

export function useQueryHistory<T = any>(
  namespace: string,
  maxRecords: number = 50
) {
  const [history, setHistory] = useState<QueryHistoryRecord<T>[]>([])

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`toolbox-history-${namespace}`)
      if (stored) {
        setHistory(JSON.parse(stored))
      }
    } catch (e) {
      console.error('Failed to load history', e)
    }
  }, [namespace])

  // Save a new record
  const saveQuery = useCallback(
    (queryInfo: any, result?: T) => {
      setHistory((prev) => {
        // create new record
        const newRecord: QueryHistoryRecord<T> = {
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          queryInfo,
          result,
        }

        // Check if identical queryInfo exists, if so, remove it to bring to top
        const filtered = prev.filter(
          (item) => JSON.stringify(item.queryInfo) !== JSON.stringify(queryInfo)
        )

        // Add to top and slice to maxRecords
        const newHistory = [newRecord, ...filtered].slice(0, maxRecords)

        try {
          localStorage.setItem(
            `toolbox-history-${namespace}`,
            JSON.stringify(newHistory)
          )
        } catch (e) {
          console.error('Failed to save history', e)
        }

        return newHistory
      })
    },
    [namespace, maxRecords]
  )

  // Delete a specific record
  const deleteQuery = useCallback(
    (id: string) => {
      setHistory((prev) => {
        const newHistory = prev.filter((item) => item.id !== id)
        try {
          localStorage.setItem(
            `toolbox-history-${namespace}`,
            JSON.stringify(newHistory)
          )
        } catch (e) {
          console.error('Failed to update history', e)
        }
        return newHistory
      })
    },
    [namespace]
  )

  // Clear all history
  const clearHistory = useCallback(() => {
    setHistory([])
    try {
      localStorage.removeItem(`toolbox-history-${namespace}`)
    } catch (e) {
      console.error('Failed to clear history', e)
    }
  }, [namespace])

  return { history, saveQuery, deleteQuery, clearHistory }
}
