/**
 * 把「从 localStorage 恢复 + 在更新时持久化」打包成一个安全 hook。
 *
 * Bug 背景：朴素写法在 React 18 StrictMode 下会触发 race ——
 *   - useEffect A（恢复）调 setState 但 state 要等下一轮才生效
 *   - useEffect B（持久化）在同一轮用「默认 state」把刚读出来的存档覆盖回默认值
 *
 * 这里加了 `restored` 闸门：在 A 完成前 B 不写任何东西。
 */
import { useEffect, useState } from 'react'
import { readSession, writeSession } from '../lib/storage'
import type { LangCode } from '../lib/languages'

export type PersistedSession = {
  providerId: string
  source: LangCode
  target: LangCode
}

export type PersistedSessionApi = PersistedSession & {
  setProviderId: (id: string) => void
  setSource: (l: LangCode) => void
  setTarget: (l: LangCode) => void
  /** true 表示已完成从 localStorage 的恢复；调试用 */
  restored: boolean
}

export function usePersistedSession(initial: PersistedSession): PersistedSessionApi {
  const [providerId, setProviderId] = useState<string>(initial.providerId)
  const [source, setSource] = useState<LangCode>(initial.source)
  const [target, setTarget] = useState<LangCode>(initial.target)
  const [restored, setRestored] = useState(false)

  useEffect(() => {
    const s = readSession()
    if (s.providerId) setProviderId(s.providerId)
    if (s.source) setSource(s.source as LangCode)
    if (s.target) setTarget(s.target as LangCode)
    setRestored(true)
  }, [])

  useEffect(() => {
    if (!restored) return
    writeSession({ providerId, source, target })
  }, [restored, providerId, source, target])

  return { providerId, source, target, setProviderId, setSource, setTarget, restored }
}
