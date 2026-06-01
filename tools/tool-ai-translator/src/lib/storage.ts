/** localStorage 封装：命名空间 `ai-translator.v1.`，在无 window/localStorage 时 silently 降级。 */

const NS = 'ai-translator.v1.'

function safe(): Storage | null {
  try {
    if (typeof window === 'undefined') return null
    return window.localStorage
  } catch {
    return null
  }
}

export function readString(key: string, fallback = ''): string {
  const ls = safe()
  if (!ls) return fallback
  try {
    const v = ls.getItem(NS + key)
    return v == null ? fallback : v
  } catch {
    return fallback
  }
}

export function writeString(key: string, value: string): void {
  const ls = safe()
  if (!ls) return
  try {
    ls.setItem(NS + key, value)
  } catch {
    /* quota / disabled — ignore */
  }
}

export function readJson<T>(key: string, fallback: T): T {
  const raw = readString(key)
  if (!raw) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function writeJson<T>(key: string, value: T): void {
  try {
    writeString(key, JSON.stringify(value))
  } catch {
    /* ignore */
  }
}

export function removeKey(key: string): void {
  const ls = safe()
  if (!ls) return
  try {
    ls.removeItem(NS + key)
  } catch {
    /* ignore */
  }
}

// ────────────── 业务键 ──────────────

export type ProviderConfig = {
  apiKey?: string
  baseUrl?: string
  model?: string
}

const PROVIDER_PREFIX = 'provider.'

export function readProviderConfig(providerId: string): ProviderConfig {
  return readJson<ProviderConfig>(PROVIDER_PREFIX + providerId, {})
}

export function writeProviderConfig(providerId: string, cfg: ProviderConfig): void {
  writeJson(PROVIDER_PREFIX + providerId, cfg)
}

export type SessionState = {
  providerId: string
  source: string
  target: string
}

const SESSION_KEY = 'session'

export function readSession(): Partial<SessionState> {
  return readJson<Partial<SessionState>>(SESSION_KEY, {})
}

export function writeSession(state: Partial<SessionState>): void {
  const cur = readSession()
  writeJson(SESSION_KEY, { ...cur, ...state })
}

export const __testing = { NS, PROVIDER_PREFIX, SESSION_KEY }
