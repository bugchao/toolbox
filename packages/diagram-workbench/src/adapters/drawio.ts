/**
 * draw.io 适配器。
 *
 * 不像 mermaid / plantuml 那样有"源代码 → SVG"管线 ——
 * draw.io 用 embedded iframe，通过 postMessage 协议传 XML。
 *
 * 安全约束：消息发送方 origin 必须在 allowlist 中，否则一律拒。
 * 默认允许 https://embed.diagrams.net 和 https://app.diagrams.net。
 */
import type { AdapterRender, AdapterValidation, DiagramAdapter } from './types'
import { DRAWIO_TEMPLATE } from '../domain/factory'

const EXT = ['.drawio', '.xml'] as const

export const DEFAULT_ALLOWED_ORIGINS = [
  'https://embed.diagrams.net',
  'https://app.diagrams.net',
] as const

/** 判定消息 origin 是否在 allowlist。导出供测试和组件复用。 */
export function isAllowedOrigin(origin: string, allowlist: readonly string[] = DEFAULT_ALLOWED_ORIGINS): boolean {
  if (!origin) return false
  // 严格相等：不接受子串 / 通配
  return allowlist.includes(origin)
}

export type DrawioMessage =
  | { event: 'init' }
  | { event: 'load' }
  | { event: 'save'; xml: string }
  | { event: 'autosave'; xml: string }
  | { event: 'export'; data: string; format: string }
  | { event: 'exit' }

/** 解析来自 iframe 的 postMessage 数据。返回 null 表示忽略（非 drawio 协议）。 */
export function parseDrawioMessage(raw: unknown): DrawioMessage | null {
  if (typeof raw !== 'string') return null
  try {
    const obj = JSON.parse(raw) as Record<string, unknown>
    if (typeof obj.event !== 'string') return null
    return obj as DrawioMessage
  } catch {
    return null
  }
}

export const drawioAdapter: DiagramAdapter = {
  engine: 'drawio',
  fileExtensions: EXT,
  template: () => DRAWIO_TEMPLATE,
  defaultSourceName: (title: string) => `${slug(title)}.drawio`,

  async validate(source: string): Promise<AdapterValidation> {
    if (!source.trim()) return { ok: false, message: 'Empty source' }
    if (!/<mxfile|<mxGraphModel/i.test(source)) {
      return { ok: false, message: 'Source does not look like draw.io XML' }
    }
    return { ok: true }
  },

  async render(_source: string): Promise<AdapterRender> {
    // draw.io 不走"源 → svg"管线，UI 层用 iframe 直接渲染
    return { ok: false, message: 'Use the draw.io iframe to render this diagram' }
  },
}

function slug(s: string): string {
  return s.trim().replace(/[^a-zA-Z0-9-_]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase() || 'diagram'
}

export function matchesDrawioExtension(name: string): boolean {
  const lower = name.toLowerCase()
  return EXT.some((e) => lower.endsWith(e))
}

/**
 * 轻量级 iframe 生命周期包装：监听窗口消息、按 allowlist 过滤、
 * 把 drawio 协议事件抛给消费方。
 */
export type DrawioFrameOptions = {
  /** 允许的 origin 列表（默认 embed.diagrams.net + app.diagrams.net） */
  allowedOrigins?: readonly string[]
  /** 消息处理（已过滤掉非 allowlist origin） */
  onMessage: (msg: DrawioMessage) => void
}

export class DrawioMessageBus {
  private readonly handler: (e: MessageEvent) => void
  private readonly target: Window

  constructor(target: Window, options: DrawioFrameOptions) {
    this.target = target
    const allowlist = options.allowedOrigins ?? DEFAULT_ALLOWED_ORIGINS
    this.handler = (e: MessageEvent) => {
      if (!isAllowedOrigin(e.origin, allowlist)) return
      const msg = parseDrawioMessage(e.data)
      if (msg) options.onMessage(msg)
    }
    this.target.addEventListener('message', this.handler)
  }

  dispose(): void {
    this.target.removeEventListener('message', this.handler)
  }
}
