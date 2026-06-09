/** 工作区 store：useReducer + IndexedDB 自动加载 / 自动保存（debounced）。 */
import React, { createContext, useCallback, useContext, useEffect, useReducer, useRef } from 'react'
import type { DiagramDocument } from '../domain/types'
import { createDefaultWorkspace } from '../domain/factory'
import { type Action, initialState, reduce, type WorkbenchState } from '../domain/reducer'
import { getWorkspace, saveWorkspace } from '../storage/indexeddb'

type StoreCtx = {
  state: WorkbenchState
  dispatch: React.Dispatch<Action>
  /** 当前选中的文档；可能为 null（空 workspace） */
  selected: DiagramDocument | null
  /** 立即触发持久化（旁路 debounce） */
  saveNow: () => Promise<void>
}

const Ctx = createContext<StoreCtx | null>(null)

const AUTOSAVE_DEBOUNCE_MS = 600

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 先用默认 workspace；mount 后异步替换为 IDB 中的快照
  const [state, dispatch] = useReducer(reduce, undefined, () => initialState(createDefaultWorkspace()))
  const hydrated = useRef(false)
  const saveTimer = useRef<number | null>(null)

  // 1) 初始 hydrate
  useEffect(() => {
    let alive = true
    getWorkspace().then((ws) => {
      if (!alive) return
      hydrated.current = true
      if (ws) dispatch({ type: 'IMPORT_WORKSPACE', workspace: ws })
    })
    return () => { alive = false }
  }, [])

  // 2) 自动保存：dirty 时 debounce 写入
  useEffect(() => {
    if (!hydrated.current || !state.dirty) return
    if (saveTimer.current != null) window.clearTimeout(saveTimer.current)
    saveTimer.current = window.setTimeout(async () => {
      dispatch({ type: 'SAVE_START' })
      try {
        await saveWorkspace(state.workspace)
        dispatch({ type: 'SAVE_OK' })
      } catch {
        dispatch({ type: 'SAVE_FAIL' })
      }
    }, AUTOSAVE_DEBOUNCE_MS)
    return () => {
      if (saveTimer.current != null) window.clearTimeout(saveTimer.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.workspace, state.dirty])

  const saveNow = useCallback(async () => {
    dispatch({ type: 'SAVE_START' })
    try {
      await saveWorkspace(state.workspace)
      dispatch({ type: 'SAVE_OK' })
    } catch {
      dispatch({ type: 'SAVE_FAIL' })
    }
  }, [state.workspace])

  const selected: DiagramDocument | null = state.workspace.selectedId
    ? state.workspace.documents.find((d) => d.id === state.workspace.selectedId) ?? null
    : null

  return <Ctx.Provider value={{ state, dispatch, selected, saveNow }}>{children}</Ctx.Provider>
}

export function useStore(): StoreCtx {
  const v = useContext(Ctx)
  if (!v) throw new Error('useStore must be used within <StoreProvider>')
  return v
}
