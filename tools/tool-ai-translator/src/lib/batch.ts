/** 批量文件翻译：串行处理文件、文件内串行翻译每段；单段失败不阻塞后续。 */
import { joinParagraphs, shouldTranslate, splitParagraphs } from './chunker'

export type FileJob = {
  id: string
  name: string
  size: number
  content: string
}

export type FileStatus = 'pending' | 'running' | 'done' | 'failed' | 'canceled'

export type FileResult = {
  id: string
  status: FileStatus
  /** 文件翻译后的完整内容（任一段失败，对应位置回填原文） */
  translatedContent?: string
  progress: { done: number; total: number }
  /** 单段失败数（影响 status：>0 但其它段成功 → done with warnings） */
  failedChunks: number
  /** 致命错误（取消、初始化失败等） */
  error?: string
}

export type BatchEvents = {
  onFileStart?: (id: string) => void
  onFileProgress?: (id: string, done: number, total: number) => void
  onFileDone?: (id: string, result: FileResult) => void
}

export type RunBatchOpts = {
  files: FileJob[]
  /** 单段翻译入口；caller 负责绑定 provider / 语种 */
  translateChunk: (text: string, signal?: AbortSignal) => Promise<string>
  signal?: AbortSignal
  events?: BatchEvents
}

export async function runBatch(opts: RunBatchOpts): Promise<Record<string, FileResult>> {
  const out: Record<string, FileResult> = {}
  for (const f of opts.files) {
    if (opts.signal?.aborted) {
      out[f.id] = { id: f.id, status: 'canceled', progress: { done: 0, total: 0 }, failedChunks: 0 }
      continue
    }
    opts.events?.onFileStart?.(f.id)
    const split = splitParagraphs(f.content)
    const total = split.chunks.length
    const translated: string[] = split.chunks.map((c) => c.text)
    let done = 0
    let failed = 0

    for (let i = 0; i < split.chunks.length; i++) {
      if (opts.signal?.aborted) {
        out[f.id] = {
          id: f.id,
          status: 'canceled',
          translatedContent: joinParagraphs(split, translated),
          progress: { done, total },
          failedChunks: failed,
        }
        opts.events?.onFileDone?.(f.id, out[f.id])
        break
      }
      const chunk = split.chunks[i]
      if (!shouldTranslate(chunk.text)) {
        translated[i] = chunk.text
      } else {
        try {
          const t = await opts.translateChunk(chunk.text, opts.signal)
          translated[i] = t || chunk.text
        } catch (e) {
          if (opts.signal?.aborted) {
            out[f.id] = {
              id: f.id,
              status: 'canceled',
              translatedContent: joinParagraphs(split, translated),
              progress: { done, total },
              failedChunks: failed,
            }
            opts.events?.onFileDone?.(f.id, out[f.id])
            break
          }
          translated[i] = chunk.text
          failed += 1
          // 透传 error message 仅作 debug；不抛
          // eslint-disable-next-line no-console
          console.warn('[ai-translator] chunk failed:', (e as Error).message)
        }
      }
      done += 1
      opts.events?.onFileProgress?.(f.id, done, total)
    }

    if (out[f.id]) continue // 已通过取消分支写入

    out[f.id] = {
      id: f.id,
      status: failed > 0 && done === total ? 'done' : (done === total ? 'done' : 'failed'),
      translatedContent: joinParagraphs(split, translated),
      progress: { done, total },
      failedChunks: failed,
    }
    opts.events?.onFileDone?.(f.id, out[f.id])
  }
  return out
}
