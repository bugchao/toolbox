import { describe, it, expect, vi } from 'vitest'
import { runBatch, type FileJob } from './batch'

const mkFile = (id: string, content: string): FileJob => ({
  id,
  name: `${id}.txt`,
  size: content.length,
  content,
})

describe('runBatch', () => {
  it('translates each paragraph and joins back with original separators', async () => {
    const file = mkFile('a', 'hello\n\nworld\n\nfoo')
    const fn = vi.fn(async (text: string) => `[${text}]`)
    const out = await runBatch({ files: [file], translateChunk: fn })
    expect(fn).toHaveBeenCalledTimes(3)
    expect(out.a.status).toBe('done')
    expect(out.a.translatedContent).toBe('[hello]\n\n[world]\n\n[foo]')
    expect(out.a.failedChunks).toBe(0)
  })

  it('skips paragraphs that should-not-translate (pure punctuation / empty)', async () => {
    const file = mkFile('a', 'hello\n\n---\n\nworld')
    const fn = vi.fn(async (text: string) => `T(${text})`)
    await runBatch({ files: [file], translateChunk: fn })
    // hello + world are translatable; --- is not
    expect(fn).toHaveBeenCalledTimes(2)
    expect(fn).toHaveBeenCalledWith('hello', undefined)
    expect(fn).toHaveBeenCalledWith('world', undefined)
  })

  it('continues on chunk failure and counts failedChunks', async () => {
    const file = mkFile('a', 'p1\n\np2\n\np3')
    let n = 0
    const fn = vi.fn(async (text: string) => {
      n += 1
      if (n === 2) throw new Error('boom')
      return `T(${text})`
    })
    const out = await runBatch({ files: [file], translateChunk: fn })
    expect(out.a.failedChunks).toBe(1)
    // 失败段保留原文
    expect(out.a.translatedContent).toBe('T(p1)\n\np2\n\nT(p3)')
    expect(out.a.progress).toEqual({ done: 3, total: 3 })
  })

  it('marks file as canceled when signal aborts between chunks', async () => {
    const file = mkFile('a', 'p1\n\np2\n\np3')
    const ctrl = new AbortController()
    const fn = vi.fn(async (text: string, signal?: AbortSignal) => {
      if (signal?.aborted) throw new Error('aborted')
      const result = `T(${text})`
      // p1 结果返回后立即触发取消；下一轮迭代会在顶部检测到 aborted
      if (text === 'p1') ctrl.abort()
      return result
    })
    const out = await runBatch({ files: [file], translateChunk: fn, signal: ctrl.signal })
    expect(out.a.status).toBe('canceled')
    expect(out.a.translatedContent).toContain('T(p1)')
    // 未完成的段保持原文
    expect(out.a.translatedContent).toContain('p2')
    expect(out.a.translatedContent).toContain('p3')
  })

  it('emits onFileStart / onFileProgress / onFileDone events', async () => {
    const file = mkFile('a', 'p1\n\np2')
    const events = {
      onFileStart: vi.fn(),
      onFileProgress: vi.fn(),
      onFileDone: vi.fn(),
    }
    await runBatch({
      files: [file],
      translateChunk: async (t) => `T(${t})`,
      events,
    })
    expect(events.onFileStart).toHaveBeenCalledWith('a')
    expect(events.onFileProgress).toHaveBeenCalledWith('a', 1, 2)
    expect(events.onFileProgress).toHaveBeenCalledWith('a', 2, 2)
    expect(events.onFileDone).toHaveBeenCalledTimes(1)
  })

  it('processes multiple files serially', async () => {
    const files = [mkFile('a', 'aa'), mkFile('b', 'bb'), mkFile('c', 'cc')]
    const order: string[] = []
    const fn = vi.fn(async (text: string) => {
      order.push(text)
      return text.toUpperCase()
    })
    await runBatch({ files, translateChunk: fn })
    expect(order).toEqual(['aa', 'bb', 'cc'])
  })
})
