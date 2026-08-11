import { useMemo, useState } from 'react'
import { useToolStorage } from '@toolbox/storage'

interface WithId {
  id: string
}

/**
 * Manages a built-in list plus a user-added, localStorage-persisted list of the
 * same shape (e.g. DNS/DoH providers), along with multi-select state over the
 * combined list. Callers own the "add" form UI (fields differ per shape) and
 * just call `addProvider` with a fully-built item.
 */
export function useCustomProviders<T extends WithId>(namespace: string, builtins: T[]) {
  const { data: customProviders, save } = useToolStorage<T[]>(namespace, 'customProviders', [])
  const allProviders = useMemo(() => [...builtins, ...customProviders], [builtins, customProviders])
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const isCustom = (id: string) => customProviders.some((p) => p.id === id)

  const addProvider = (provider: T) => {
    save([...customProviders, provider])
  }

  const removeProvider = (id: string) => {
    save(customProviders.filter((p) => p.id !== id))
    setSelected((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }

  const toggleSelected = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const allSelected = selected.size === allProviders.length
  const toggleAll = () => {
    setSelected(allSelected ? new Set() : new Set(allProviders.map((p) => p.id)))
  }

  return {
    allProviders,
    customProviders,
    isCustom,
    addProvider,
    removeProvider,
    selected,
    toggleSelected,
    allSelected,
    toggleAll,
  }
}
