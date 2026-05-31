/** WebLLM 单例 + 流式生成器封装 —— 按需 import，避免初始 bundle 拉爆。 */
import type { MLCEngineInterface, InitProgressReport } from '@mlc-ai/web-llm'

type Engine = MLCEngineInterface

let enginePromise: Promise<Engine> | null = null
let currentModel: string | null = null

export type ProgressHook = (report: InitProgressReport) => void

export async function ensureEngine(model: string, onProgress?: ProgressHook): Promise<Engine> {
  // 模型不同 → 重建
  if (enginePromise && currentModel === model) return enginePromise
  currentModel = model
  enginePromise = (async () => {
    const { CreateMLCEngine } = await import('@mlc-ai/web-llm')
    return CreateMLCEngine(model, {
      initProgressCallback: (r) => onProgress?.(r),
    })
  })()
  return enginePromise
}

export function isEngineReady(model: string): boolean {
  return enginePromise !== null && currentModel === model
}

export async function resetEngine(): Promise<void> {
  if (!enginePromise) return
  try {
    const e = await enginePromise
    await e.unload?.()
  } catch {
    /* ignore */
  }
  enginePromise = null
  currentModel = null
}

/** 把 WebLLM 的流式响应包成 AsyncIterable<string>。 */
export async function* webllmStream(input: {
  model: string
  messages: { role: string; content: string }[]
  signal?: AbortSignal
}): AsyncIterable<string> {
  const engine = await ensureEngine(input.model)
  const chunks = await engine.chat.completions.create({
    messages: input.messages as { role: 'system' | 'user' | 'assistant'; content: string }[],
    stream: true,
    temperature: 0.3,
  })
  for await (const c of chunks) {
    if (input.signal?.aborted) return
    const piece = c?.choices?.[0]?.delta?.content
    if (piece) yield piece
  }
}
