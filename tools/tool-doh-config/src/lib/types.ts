export interface DohProvider {
  id: string
  name: string
  url: string
  description: string
  /** 'json': Google/Cloudflare 风格 JSON API；'wire': RFC 8484 标准二进制协议 */
  protocol: 'json' | 'wire'
  /** 仅 protocol==='json' 时生效 */
  needsJsonAccept: boolean
}

export type ConfigTarget = 'firefox' | 'chrome-edge' | 'macos' | 'windows' | 'linux'

export interface LatencyResult {
  id: string
  name: string
  avg: number
  min: number
  max: number
  ok: boolean
  answers: string[]
}
