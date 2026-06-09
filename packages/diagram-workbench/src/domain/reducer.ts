/** workspace reducer：所有状态过渡均不可变。 */
import type { DiagramDocument, DiagramEngine, DiagramSettings, DiagramWorkspace, SaveStatus } from './types'
import { createDocument, now } from './factory'

export type Action =
  | { type: 'SELECT'; id: string }
  | { type: 'CREATE'; engine: DiagramEngine; title?: string }
  | { type: 'UPDATE_SOURCE'; id: string; source: string }
  | { type: 'UPDATE_TITLE'; id: string; title: string }
  | { type: 'UPDATE_SETTINGS'; id: string; patch: Partial<DiagramSettings> }
  | { type: 'SET_MAIN'; id: string | null }
  | { type: 'DELETE'; id: string }
  | { type: 'IMPORT_WORKSPACE'; workspace: DiagramWorkspace }
  | { type: 'IMPORT_DOCUMENT'; document: DiagramDocument }
  | { type: 'SAVE_START' }
  | { type: 'SAVE_OK' }
  | { type: 'SAVE_FAIL' }

export type WorkbenchState = {
  workspace: DiagramWorkspace
  saveStatus: SaveStatus
  /** workspace 有未保存的差异 */
  dirty: boolean
}

function patchDoc(
  ws: DiagramWorkspace,
  id: string,
  fn: (d: DiagramDocument) => DiagramDocument,
): DiagramWorkspace {
  const idx = ws.documents.findIndex((d) => d.id === id)
  if (idx === -1) return ws
  const next = ws.documents.slice()
  next[idx] = { ...fn(next[idx]), updatedAt: now() }
  return { ...ws, documents: next, updatedAt: now() }
}

export function reduce(state: WorkbenchState, action: Action): WorkbenchState {
  switch (action.type) {
    case 'SELECT': {
      if (!state.workspace.documents.some((d) => d.id === action.id)) return state
      return { ...state, workspace: { ...state.workspace, selectedId: action.id } }
    }

    case 'CREATE': {
      const doc = createDocument(action.engine, action.title ?? `Untitled ${action.engine}`)
      const ws = {
        ...state.workspace,
        documents: [...state.workspace.documents, doc],
        selectedId: doc.id,
        // 第一张图自动成为主图
        mainId: state.workspace.mainId ?? doc.id,
        updatedAt: now(),
      }
      return { ...state, workspace: ws, dirty: true }
    }

    case 'UPDATE_SOURCE': {
      const ws = patchDoc(state.workspace, action.id, (d) => ({ ...d, source: action.source }))
      return { ...state, workspace: ws, dirty: true }
    }

    case 'UPDATE_TITLE': {
      const ws = patchDoc(state.workspace, action.id, (d) => ({ ...d, title: action.title }))
      return { ...state, workspace: ws, dirty: true }
    }

    case 'UPDATE_SETTINGS': {
      const ws = patchDoc(state.workspace, action.id, (d) => ({
        ...d,
        settings: { ...d.settings, ...action.patch },
      }))
      return { ...state, workspace: ws, dirty: true }
    }

    case 'SET_MAIN': {
      if (action.id != null && !state.workspace.documents.some((d) => d.id === action.id)) return state
      return {
        ...state,
        workspace: { ...state.workspace, mainId: action.id, updatedAt: now() },
        dirty: true,
      }
    }

    case 'DELETE': {
      const docs = state.workspace.documents.filter((d) => d.id !== action.id)
      if (docs.length === state.workspace.documents.length) return state
      const ws: DiagramWorkspace = {
        ...state.workspace,
        documents: docs,
        selectedId: state.workspace.selectedId === action.id
          ? (docs[0]?.id ?? null)
          : state.workspace.selectedId,
        mainId: state.workspace.mainId === action.id
          ? (docs[0]?.id ?? null)
          : state.workspace.mainId,
        updatedAt: now(),
      }
      return { ...state, workspace: ws, dirty: true }
    }

    case 'IMPORT_WORKSPACE': {
      // 完全替换；schema 校验由 storage/json 负责
      return { ...state, workspace: action.workspace, dirty: true }
    }

    case 'IMPORT_DOCUMENT': {
      const ws: DiagramWorkspace = {
        ...state.workspace,
        documents: [...state.workspace.documents, action.document],
        selectedId: action.document.id,
        mainId: state.workspace.mainId ?? action.document.id,
        updatedAt: now(),
      }
      return { ...state, workspace: ws, dirty: true }
    }

    case 'SAVE_START':
      return { ...state, saveStatus: 'saving' }
    case 'SAVE_OK':
      return { ...state, saveStatus: 'saved', dirty: false }
    case 'SAVE_FAIL':
      return { ...state, saveStatus: 'error' }

    default:
      return state
  }
}

export function initialState(workspace: DiagramWorkspace): WorkbenchState {
  return { workspace, saveStatus: 'idle', dirty: false }
}
