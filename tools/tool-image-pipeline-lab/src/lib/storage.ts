import { EFFECTS } from './effects'
import { newStep } from './pipeline'
import type { EffectType, PipelineStep } from './types'

const KEY = 'toolbox.image-pipeline-lab.pipelines.v1'

export interface SavedPipeline {
  name: string
  steps: PipelineStep[]
  savedAt: number
}

export function listPipelines(): SavedPipeline[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as SavedPipeline[]) : []
  } catch {
    return []
  }
}

export function savePipeline(name: string, steps: PipelineStep[]): void {
  const rest = listPipelines().filter((p) => p.name !== name)
  localStorage.setItem(KEY, JSON.stringify([...rest, { name, steps, savedAt: Date.now() }]))
}

export function deletePipeline(name: string): void {
  localStorage.setItem(KEY, JSON.stringify(listPipelines().filter((p) => p.name !== name)))
}

export function serializePipeline(steps: PipelineStep[]): string {
  return JSON.stringify(
    { version: 1, steps: steps.map(({ type, value, enabled }) => ({ type, value, enabled })) },
    null,
    2,
  )
}

/** 解析导入的管线 JSON；非法结构抛 Error，value clamp 到效果范围，id 重新生成 */
export function parsePipelineJson(text: string): PipelineStep[] {
  const parsed: unknown = JSON.parse(text)
  const steps = (parsed as { steps?: unknown }).steps
  if (!Array.isArray(steps)) throw new Error('steps must be an array')
  return steps.map((raw) => {
    const { type, value, enabled } = raw as { type?: unknown; value?: unknown; enabled?: unknown }
    if (typeof type !== 'string' || !(type in EFFECTS)) throw new Error(`unknown effect: ${String(type)}`)
    if (typeof value !== 'number' || Number.isNaN(value)) throw new Error('value must be a number')
    const def = EFFECTS[type as EffectType]
    return {
      ...newStep(type as EffectType),
      value: Math.min(def.max, Math.max(def.min, value)),
      enabled: enabled !== false,
    }
  })
}
