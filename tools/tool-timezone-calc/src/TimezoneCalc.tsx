import React, { useState, useEffect } from 'react'
import { Plus, Trash2, Clock } from 'lucide-react'
import { PageHero } from '@toolbox/ui-kit'
import { useToolStorage } from '@toolbox/storage'

const TIMEZONES = [
  { label: '北京 / 上海', tz: 'Asia/Shanghai', flag: '🇨🇳' },
  { label: '香港', tz: 'Asia/Hong_Kong', flag: '🇭🇰' },
  { label: '东京', tz: 'Asia/Tokyo', flag: '🇯🇵' },
  { label: '首尔', tz: 'Asia/Seoul', flag: '🇰🇷' },
  { label: '新加坡', tz: 'Asia/Singapore', flag: '🇸🇬' },
  { label: '曼谷', tz: 'Asia/Bangkok', flag: '🇹🇭' },
  { label: '迪拜', tz: 'Asia/Dubai', flag: '🇦🇪' },
  { label: '莫斯科', tz: 'Europe/Moscow', flag: '🇷🇺' },
  { label: '巴黎 / 柏林', tz: 'Europe/Paris', flag: '🇪🇺' },
  { label: '伦敦', tz: 'Europe/London', flag: '🇬🇧' },
  { label: '纽约', tz: 'America/New_York', flag: '🇺🇸' },
  { label: '洛杉矶', tz: 'America/Los_Angeles', flag: '🇺🇸' },
  { label: '悉尼', tz: 'Australia/Sydney', flag: '🇦🇺' },
  { label: 'UTC', tz: 'UTC', flag: '🌐' },
]

interface TzCard { tz: string }

interface TimezoneState {
  cards: TzCard[]
  baseTz: string
}

const DEFAULT_STATE: TimezoneState = {
  cards: [
    { tz: 'Asia/Shanghai' },
    { tz: 'America/New_York' },
    { tz: 'Europe/London' },
    { tz: 'Asia/Tokyo' },
  ],
  baseTz: 'Asia/Shanghai',
}

function formatTime(date: Date, tz: string) {
  return date.toLocaleString('zh-CN', { timeZone: tz, hour12: false, month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

function getOffset(tz: string): string {
  try {
    const now = new Date()
    const local = new Date(now.toLocaleString('en-US', { timeZone: tz }))
    const utc = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }))
    const diff = Math.round((local.getTime() - utc.getTime()) / 3600000)
    return `UTC${diff >= 0 ? '+' : ''}${diff}`
  } catch { return '' }
}

function isDaytime(date: Date, tz: string): boolean {
  const h = parseInt(date.toLocaleString('en-US', { timeZone: tz, hour: '2-digit', hour12: false }))
  return h >= 8 && h < 20
}

export default function TimezoneCalc() {
  const { data: state, save } = useToolStorage<TimezoneState>('timezone-calc', 'data', DEFAULT_STATE)
  const [now, setNow] = useState(new Date())
  const [baseTime, setBaseTime] = useState('')
  const [addTz, setAddTz] = useState(TIMEZONES[4].tz)

  const { cards, baseTz } = state
  const set = (patch: Partial<TimezoneState>) => save({ ...state, ...patch })

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const displayTime = baseTime ? new Date(baseTime) : now

  const addCard = () => {
    if (cards.find(c => c.tz === addTz)) return
    set({ cards: [...cards, { tz: addTz }] })
  }

  const removeCard = (tz: string) => set({ cards: cards.filter(c => c.tz !== tz) })

  const getTzInfo = (tz: string) => TIMEZONES.find(t => t.tz === tz) || { label: tz, flag: '🌐' }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHero
        title="时差计算器"
        description="多时区时间对比，支持自定义时间换算"
        icon={Clock}
      />
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* 时间换算 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">时间换算</h2>
          <div className="flex gap-2 flex-wrap">
            <input type="datetime-local" value={baseTime} onChange={e => setBaseTime(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500" />
            <select value={baseTz} onChange={e => set({ baseTz: e.target.value })}
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none">
              {TIMEZONES.map(t => <option key={t.tz} value={t.tz}>{t.flag} {t.label}</option>)}
            </select>
            {baseTime && <button onClick={() => setBaseTime('')} className="px-3 py-2 text-sm text-gray-400 hover:text-gray-600 border border-gray-300 dark:border-gray-600 rounded-lg">用当前时间</button>}
          </div>
        </div>

        {/* 时区卡片 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {cards.map(card => {
            const info = getTzInfo(card.tz)
            const timeStr = formatTime(displayTime, card.tz)
            const daytime = isDaytime(displayTime, card.tz)
            const offset = getOffset(card.tz)
            return (
              <div key={card.tz} className={`rounded-xl border p-4 relative ${
                daytime
                  ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800'
                  : 'bg-slate-50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-700'
              }`}>
                <button onClick={() => removeCard(card.tz)}
                  className="absolute top-3 right-3 text-gray-300 hover:text-red-400 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{info.flag}</span>
                  <div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{info.label}</div>
                    <div className="text-xs text-gray-400">{offset} · {daytime ? '☀️ 白天' : '🌙 夜晚'}</div>
                  </div>
                </div>
                <div className="font-mono text-2xl font-bold text-gray-900 dark:text-gray-100">{timeStr}</div>
              </div>
            )
          })}
        </div>

        {/* 添加时区 */}
        <div className="flex gap-2">
          <select value={addTz} onChange={e => setAddTz(e.target.value)}
            className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none">
            {TIMEZONES.filter(t => !cards.find(c => c.tz === t.tz)).map(t => (
              <option key={t.tz} value={t.tz}>{t.flag} {t.label}</option>
            ))}
          </select>
          <button onClick={addCard}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" />添加
          </button>
        </div>

        {/* 存储提示 */}
        <p className="text-xs text-center text-gray-400">✅ 时区配置已自动保存，下次访问自动恢复</p>
      </div>
    </div>
  )
}
