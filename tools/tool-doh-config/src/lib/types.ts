export interface DohProvider {
  id: string
  name: string
  url: string
  description: string
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
