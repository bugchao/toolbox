/** Mermaid 适配器：lazy-import mermaid 避免初始 bundle 拉爆。 */
import type { AdapterRender, AdapterValidation, DiagramAdapter } from './types'
import { MERMAID_TEMPLATE } from '../domain/factory'

const EXT = ['.mmd', '.mermaid'] as const

let initialized = false
let renderSeq = 0

async function load() {
  const mod = await import('mermaid')
  if (!initialized) {
    mod.default.initialize({ startOnLoad: false, securityLevel: 'strict' })
    initialized = true
  }
  return mod.default
}

export const mermaidAdapter: DiagramAdapter = {
  engine: 'mermaid',
  fileExtensions: EXT,
  template: () => MERMAID_TEMPLATE,
  defaultSourceName: (title: string) => `${slug(title)}.mmd`,

  async validate(source: string): Promise<AdapterValidation> {
    if (!source.trim()) return { ok: false, message: 'Empty source' }
    try {
      const m = await load()
      // mermaid.parse 在源码有错时抛
      await m.parse(source)
      return { ok: true }
    } catch (e) {
      const msg = (e as Error).message ?? String(e)
      const line = guessLine(msg)
      return { ok: false, message: msg, line }
    }
  },

  async render(source: string, options = {}): Promise<AdapterRender> {
    if (!source.trim()) return { ok: false, message: 'Empty source' }
    try {
      const m = await load()
      if (options.theme && options.theme !== 'default') {
        m.initialize({ theme: options.theme as 'dark' | 'forest' | 'neutral' })
      }
      renderSeq += 1
      const { svg } = await m.render(`mw-mermaid-${renderSeq}`, source)
      return { ok: true, svg }
    } catch (e) {
      return { ok: false, message: (e as Error).message ?? String(e) }
    }
  },
}

function guessLine(msg: string): number | undefined {
  const m = msg.match(/line (\d+)/i)
  return m ? Number(m[1]) : undefined
}

function slug(s: string): string {
  return s.trim().replace(/[^a-zA-Z0-9-_]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase() || 'diagram'
}

/** 测试用：是否能根据扩展名匹配。 */
export function matchesMermaidExtension(name: string): boolean {
  const lower = name.toLowerCase()
  return EXT.some((e) => lower.endsWith(e))
}
