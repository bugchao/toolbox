/**
 * PlantUML 适配器。
 *
 * 编码协议：
 * 1. UTF-8 → raw deflate（pako）
 * 2. 自定义 6-bit alphabet 编码：`0-9A-Za-z-_`
 * 3. URL: `${serverUrl}<format>/${encoded}`，format ∈ {svg, png, txt}
 *
 * server URL 必须以 `/` 结尾；默认指向 localhost，避免敏感架构图被发往公网。
 */
import { deflateRaw } from 'pako'
import type { AdapterRender, AdapterValidation, DiagramAdapter } from './types'
import { PLANTUML_TEMPLATE } from '../domain/factory'

const EXT = ['.puml', '.plantuml'] as const

const ALPHABET =
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_'

/** 三字节 → 四字符 PlantUML 编码。 */
function encode64(bytes: Uint8Array): string {
  let out = ''
  for (let i = 0; i < bytes.length; i += 3) {
    const b1 = bytes[i]
    const b2 = i + 1 < bytes.length ? bytes[i + 1] : 0
    const b3 = i + 2 < bytes.length ? bytes[i + 2] : 0
    const c1 = b1 >> 2
    const c2 = ((b1 & 0x3) << 4) | (b2 >> 4)
    const c3 = ((b2 & 0xf) << 2) | (b3 >> 6)
    const c4 = b3 & 0x3f
    out += ALPHABET[c1] + ALPHABET[c2]
    if (i + 1 < bytes.length) out += ALPHABET[c3]
    if (i + 2 < bytes.length) out += ALPHABET[c4]
  }
  return out
}

/** UTF-8 → deflate → custom-base64。导出供测试单独验证。 */
export function encodePlantUml(source: string): string {
  const utf8 = new TextEncoder().encode(source)
  const compressed = deflateRaw(utf8)
  return encode64(compressed)
}

/** 标准化 server URL：保证末尾带 `/`，去掉空白。 */
export function normalizeServerUrl(url: string | undefined): string {
  const v = (url ?? '').trim()
  if (!v) return 'http://localhost:8080/plantuml/'
  return v.endsWith('/') ? v : v + '/'
}

export type PlantUmlFormat = 'svg' | 'png' | 'txt'

export function buildPlantUmlUrl(source: string, format: PlantUmlFormat, serverUrl: string): string {
  return `${normalizeServerUrl(serverUrl)}${format}/${encodePlantUml(source)}`
}

/** 让 SecurityLevel 可注入；测试时给假 fetch */
export type PlantUmlOptions = {
  serverUrl?: string
  format?: PlantUmlFormat
  /** 注入点（测试 mock） */
  fetchFn?: typeof fetch
}

export const plantumlAdapter: DiagramAdapter = {
  engine: 'plantuml',
  fileExtensions: EXT,
  template: () => PLANTUML_TEMPLATE,
  defaultSourceName: (title: string) => `${slug(title)}.puml`,

  async validate(source: string): Promise<AdapterValidation> {
    if (!source.trim()) return { ok: false, message: 'Empty source' }
    if (!/@startuml/i.test(source)) {
      return { ok: false, message: 'Missing @startuml directive' }
    }
    if (!/@enduml/i.test(source)) {
      return { ok: false, message: 'Missing @enduml directive' }
    }
    return { ok: true }
  },

  async render(source: string, options: Record<string, unknown> = {}): Promise<AdapterRender> {
    const opts = options as PlantUmlOptions
    const v = await this.validate(source)
    if (!v.ok) return v
    const fetchFn = opts.fetchFn ?? fetch
    const url = buildPlantUmlUrl(source, opts.format ?? 'svg', opts.serverUrl ?? '')
    try {
      const res = await fetchFn(url)
      if (!res.ok) return { ok: false, message: `PlantUML server returned ${res.status}` }
      const svg = await res.text()
      if (!svg.includes('<svg')) {
        return { ok: false, message: 'Server response was not SVG' }
      }
      return { ok: true, svg }
    } catch (e) {
      return { ok: false, message: `Cannot reach PlantUML server: ${(e as Error).message}` }
    }
  },
}

function slug(s: string): string {
  return s.trim().replace(/[^a-zA-Z0-9-_]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase() || 'diagram'
}

export function matchesPlantUmlExtension(name: string): boolean {
  const lower = name.toLowerCase()
  return EXT.some((e) => lower.endsWith(e))
}

export const __testing = { encode64, ALPHABET }
