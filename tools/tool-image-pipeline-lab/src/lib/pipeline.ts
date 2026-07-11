import { EFFECTS } from './effects'
import type { EffectType, PipelineStep } from './types'

export interface PipelineHistory {
  past: PipelineStep[][]
  present: PipelineStep[]
  future: PipelineStep[][]
  /** 滑杆连续调参合并：连续对同一步骤 setValue 只记一条历史 */
  lastEditedId?: string
}

export type PipelineAction =
  | { type: 'add'; effect: EffectType }
  | { type: 'remove'; id: string }
  | { type: 'move'; id: string; dir: -1 | 1 }
  | { type: 'toggle'; id: string }
  | { type: 'setValue'; id: string; value: number }
  | { type: 'replace'; steps: PipelineStep[] }
  | { type: 'undo' }
  | { type: 'redo' }

export const initialHistory: PipelineHistory = { past: [], present: [], future: [] }

export function newStep(effect: EffectType): PipelineStep {
  return { id: crypto.randomUUID(), type: effect, value: EFFECTS[effect].defaultValue, enabled: true }
}

function commit(h: PipelineHistory, next: PipelineStep[], lastEditedId?: string): PipelineHistory {
  return { past: [...h.past, h.present], present: next, future: [], lastEditedId }
}

export function pipelineReducer(h: PipelineHistory, action: PipelineAction): PipelineHistory {
  switch (action.type) {
    case 'add':
      return commit(h, [...h.present, newStep(action.effect)])
    case 'remove': {
      const next = h.present.filter((s) => s.id !== action.id)
      return next.length === h.present.length ? h : commit(h, next)
    }
    case 'move': {
      const from = h.present.findIndex((s) => s.id === action.id)
      const to = from + action.dir
      if (from < 0 || to < 0 || to >= h.present.length) return h
      const next = [...h.present]
      ;[next[from], next[to]] = [next[to], next[from]]
      return commit(h, next)
    }
    case 'toggle': {
      const next = h.present.map((s) => (s.id === action.id ? { ...s, enabled: !s.enabled } : s))
      return commit(h, next)
    }
    case 'setValue': {
      const next = h.present.map((s) => (s.id === action.id ? { ...s, value: action.value } : s))
      if (h.lastEditedId === action.id) {
        return { ...h, present: next, future: [] }
      }
      return commit(h, next, action.id)
    }
    case 'replace':
      return commit(h, action.steps)
    case 'undo': {
      if (h.past.length === 0) return h
      return {
        past: h.past.slice(0, -1),
        present: h.past[h.past.length - 1],
        future: [h.present, ...h.future],
      }
    }
    case 'redo': {
      if (h.future.length === 0) return h
      return {
        past: [...h.past, h.present],
        present: h.future[0],
        future: h.future.slice(1),
      }
    }
  }
}
