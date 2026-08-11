interface DohProviderBase {
  id: string
  name: string
  url: string
  description: string
}

/** Google/Cloudflare 风格 JSON API */
export interface DohProviderJson extends DohProviderBase {
  protocol: 'json'
  needsJsonAccept: boolean
}

/** RFC 8484 标准二进制协议 */
export interface DohProviderWire extends DohProviderBase {
  protocol: 'wire'
}

export type DohProvider = DohProviderJson | DohProviderWire

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
