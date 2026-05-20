import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Plus,
  Trash2,
  EyeOff,
  Eye,
  ChevronDown,
  Repeat,
} from 'lucide-react'
import { PageHero } from '@toolbox/ui-kit'
import { useToolStorage } from '@toolbox/storage'
import { useTranslation } from 'react-i18next'

import {
  BUILT_IN_HOLIDAYS,
  LUNAR_YEAR_MAX,
  LUNAR_YEAR_MIN,
  computeRemaining,
  getNextOccurrence,
  lunarDayName,
  lunarMonthName,
  lunarToGregorian,
  nextLunarOccurrence,
  parseIso,
  startOfDay,
  toIso,
  type Remaining,
} from './holidays'

const NAMESPACE = 'toolHolidayCountdown'

interface CustomHoliday {
  id: string
  name: string
  emoji: string
  // 公历或农历；老数据没有该字段时默认 'gregorian'
  calendarType?: 'gregorian' | 'lunar'
  // gregorian: YYYY-MM-DD 公历日期
  // lunar: 把 lunarYear-lunarMonth-lunarDay 编码到 date 字符串中（不直接当公历用）
  date: string
  recurring: boolean
}

interface PersistedState {
  customs: CustomHoliday[]
  hiddenBuiltInIds: string[]
  showHidden: boolean
}

const DEFAULT_STATE: PersistedState = {
  customs: [],
  hiddenBuiltInIds: [],
  showHidden: false,
}

const CUSTOM_EMOJI_OPTIONS = ['🎂', '💍', '🎓', '🏆', '✈️', '🎁', '⏰', '⭐', '❤️']

const HolidayCountdown: React.FC = () => {
  const { t, i18n } = useTranslation(NAMESPACE)
  const isZh = (i18n.resolvedLanguage || i18n.language || 'zh').startsWith('zh')

  const { data, save, loading } = useToolStorage<PersistedState>(
    'holiday-countdown',
    'state',
    DEFAULT_STATE,
  )

  // 每分钟刷新一次倒计时
  const [now, setNow] = useState<Date>(new Date())
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 60_000)
    return () => window.clearInterval(id)
  }, [])

  const [draft, setDraft] = useState<{
    name: string
    calendarType: 'gregorian' | 'lunar'
    date: string
    lunarYear: number
    lunarMonth: number
    lunarDay: number
    emoji: string
    recurring: boolean
  }>({
    name: '',
    calendarType: 'gregorian',
    date: toIso(new Date()),
    lunarYear: Math.max(LUNAR_YEAR_MIN, new Date().getFullYear()),
    lunarMonth: 1,
    lunarDay: 1,
    emoji: CUSTOM_EMOJI_OPTIONS[0],
    recurring: true,
  })
  const [formOpen, setFormOpen] = useState(true)

  // ── 把所有节日（内置 + 自定义）合并 + 计算下次发生 + 排序 ──
  interface DisplayItem {
    key: string
    name: string
    emoji: string
    isCustom: boolean
    isLunar: boolean
    customId?: string
    builtInId?: string
    next: Date | null
    remaining: Remaining | null
  }

  const items: DisplayItem[] = useMemo(() => {
    const visible: DisplayItem[] = []
    // 内置
    for (const h of BUILT_IN_HOLIDAYS) {
      if (data.hiddenBuiltInIds.includes(h.id)) continue
      const next = getNextOccurrence(h, now)
      visible.push({
        key: `b:${h.id}`,
        name: isZh ? h.zh : h.en,
        emoji: h.emoji,
        isCustom: false,
        isLunar: h.type === 'lunar',
        builtInId: h.id,
        next,
        remaining: next ? computeRemaining(next, now) : null,
      })
    }
    // 自定义
    const today = startOfDay(now)
    for (const c of data.customs) {
      const ct = c.calendarType ?? 'gregorian'
      let next: Date | null = null
      if (ct === 'lunar') {
        const [ly, lm, ld] = c.date.split('-').map(Number)
        if (c.recurring) {
          next = nextLunarOccurrence(lm, ld, now)
        } else {
          const cand = lunarToGregorian(ly, lm, ld)
          if (cand && cand.getTime() >= today.getTime()) next = cand
        }
      } else {
        const base = parseIso(c.date)
        if (c.recurring) {
          const year = today.getFullYear()
          const tryThisYear = new Date(year, base.getMonth(), base.getDate())
          next = tryThisYear.getTime() >= today.getTime()
            ? tryThisYear
            : new Date(year + 1, base.getMonth(), base.getDate())
        } else {
          if (base.getTime() >= today.getTime()) next = base
        }
      }
      visible.push({
        key: `c:${c.id}`,
        name: c.name || '—',
        emoji: c.emoji,
        isCustom: true,
        isLunar: ct === 'lunar',
        customId: c.id,
        next,
        remaining: next ? computeRemaining(next, now) : null,
      })
    }
    // 按剩余时间升序，null（过期/无未来日期）放最后
    visible.sort((a, b) => {
      if (!a.remaining && !b.remaining) return 0
      if (!a.remaining) return 1
      if (!b.remaining) return -1
      return a.remaining.totalMs - b.remaining.totalMs
    })
    return visible
  }, [data, now, isZh])

  // ── 隐藏的内置节日（用于"显示/隐藏"折叠区） ──
  const hiddenHolidays = useMemo(
    () =>
      BUILT_IN_HOLIDAYS.filter((h) => data.hiddenBuiltInIds.includes(h.id)),
    [data.hiddenBuiltInIds],
  )

  const addCustom = useCallback(() => {
    const name = draft.name.trim()
    if (!name) return
    let dateStr: string
    if (draft.calendarType === 'lunar') {
      // 农历自定义日期需要在我们的 LUT 范围内可解析
      const probe = lunarToGregorian(draft.lunarYear, draft.lunarMonth, draft.lunarDay)
      if (!probe) return
      dateStr = `${draft.lunarYear}-${String(draft.lunarMonth).padStart(2, '0')}-${String(draft.lunarDay).padStart(2, '0')}`
    } else {
      if (!draft.date) return
      dateStr = draft.date
    }
    const item: CustomHoliday = {
      id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name,
      emoji: draft.emoji,
      calendarType: draft.calendarType,
      date: dateStr,
      recurring: draft.recurring,
    }
    void save({ ...data, customs: [...data.customs, item] })
    setDraft({ ...draft, name: '' })
  }, [draft, data, save])

  const removeCustom = useCallback(
    (id: string) => {
      void save({ ...data, customs: data.customs.filter((c) => c.id !== id) })
    },
    [data, save],
  )

  const hideBuiltIn = useCallback(
    (id: string) => {
      if (data.hiddenBuiltInIds.includes(id)) return
      void save({ ...data, hiddenBuiltInIds: [...data.hiddenBuiltInIds, id] })
    },
    [data, save],
  )

  const restoreBuiltIn = useCallback(
    (id: string) => {
      void save({ ...data, hiddenBuiltInIds: data.hiddenBuiltInIds.filter((x) => x !== id) })
    },
    [data, save],
  )

  if (loading) {
    return (
      <div className="w-full space-y-6">
        <PageHero title={t('title')} description={t('description')} />
        <div className="text-center text-sm text-gray-400 py-12">{t('loading')}</div>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6 pb-24">
      <PageHero title={t('title')} description={t('description')} />

      {/* 添加自定义日期 */}
      <section className="rounded-lg border border-gray-200 bg-white">
        <button
          type="button"
          onClick={() => setFormOpen((v) => !v)}
          className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t('form.title')}
          <ChevronDown
            className={`w-4 h-4 ml-auto text-gray-400 transition-transform ${
              formOpen ? 'rotate-180' : ''
            }`}
          />
        </button>
        {formOpen && (
          <div className="px-4 pb-4 border-t border-gray-100 pt-3 space-y-3">
            {/* 日历类型 */}
            <div className="inline-flex border border-gray-300 rounded-md overflow-hidden">
              <button
                type="button"
                onClick={() => setDraft({ ...draft, calendarType: 'gregorian' })}
                className={`px-3 py-1 text-xs ${
                  draft.calendarType === 'gregorian'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {t('form.calendarGregorian')}
              </button>
              <button
                type="button"
                onClick={() => setDraft({ ...draft, calendarType: 'lunar' })}
                className={`px-3 py-1 text-xs ${
                  draft.calendarType === 'lunar'
                    ? 'bg-amber-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {t('form.calendarLunar')}
              </button>
            </div>

            {/* 名称 + 日期 + emoji + 添加 */}
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-2 items-start">
              <input
                type="text"
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && addCustom()}
                placeholder={t('form.namePlaceholder')}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <select
                value={draft.emoji}
                onChange={(e) => setDraft({ ...draft, emoji: e.target.value })}
                className="px-2 py-1.5 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {CUSTOM_EMOJI_OPTIONS.map((e) => (
                  <option key={e} value={e}>
                    {e}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={addCustom}
                disabled={!draft.name.trim() || (draft.calendarType === 'gregorian' && !draft.date)}
                className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-300 transition-colors flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                {t('form.add')}
              </button>
            </div>

            {/* 日期输入区（按 calendarType 切换） */}
            {draft.calendarType === 'gregorian' ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 shrink-0">{t('form.dateLabel')}:</span>
                <input
                  type="date"
                  value={draft.date}
                  onChange={(e) => setDraft({ ...draft, date: e.target.value })}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-gray-500 shrink-0">{t('form.lunarLabel')}:</span>
                {!draft.recurring && (
                  <select
                    value={draft.lunarYear}
                    onChange={(e) => setDraft({ ...draft, lunarYear: Number(e.target.value) })}
                    className="px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    {Array.from({ length: LUNAR_YEAR_MAX - LUNAR_YEAR_MIN + 1 }).map((_, i) => {
                      const y = LUNAR_YEAR_MIN + i
                      return (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      )
                    })}
                  </select>
                )}
                <select
                  value={draft.lunarMonth}
                  onChange={(e) => setDraft({ ...draft, lunarMonth: Number(e.target.value) })}
                  className="px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {Array.from({ length: 12 }).map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {lunarMonthName(i + 1, isZh ? 'zh' : 'en')}
                    </option>
                  ))}
                </select>
                <select
                  value={draft.lunarDay}
                  onChange={(e) => setDraft({ ...draft, lunarDay: Number(e.target.value) })}
                  className="px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {Array.from({ length: 30 }).map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {lunarDayName(i + 1, isZh ? 'zh' : 'en')}
                    </option>
                  ))}
                </select>
                <span className="text-xs text-gray-400">
                  {t('form.lunarRangeHint', { min: LUNAR_YEAR_MIN, max: LUNAR_YEAR_MAX })}
                </span>
              </div>
            )}

            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={draft.recurring}
                onChange={(e) => setDraft({ ...draft, recurring: e.target.checked })}
                className="rounded border-gray-300"
              />
              <Repeat className="w-4 h-4 text-indigo-500" />
              {t('form.recurring')}
              <span className="text-xs text-gray-400">{t('form.recurringHint')}</span>
            </label>
          </div>
        )}
      </section>

      {/* 卡片网格 */}
      {items.length > 0 ? (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map((item) => (
            <CountdownCard
              key={item.key}
              item={item}
              onHide={() => item.builtInId && hideBuiltIn(item.builtInId)}
              onRemove={() => item.customId && removeCustom(item.customId)}
              isZh={isZh}
              t={t}
            />
          ))}
        </section>
      ) : (
        <section className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-12 text-center text-sm text-gray-500">
          {t('empty')}
        </section>
      )}

      {/* 隐藏的节日恢复区 */}
      {hiddenHolidays.length > 0 && (
        <section className="rounded-lg border border-gray-200 bg-white">
          <button
            type="button"
            onClick={() => save({ ...data, showHidden: !data.showHidden })}
            className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <EyeOff className="w-4 h-4" />
            {t('hidden.title')} ({hiddenHolidays.length})
            <ChevronDown
              className={`w-4 h-4 ml-auto text-gray-400 transition-transform ${
                data.showHidden ? 'rotate-180' : ''
              }`}
            />
          </button>
          {data.showHidden && (
            <ul className="px-4 pb-4 border-t border-gray-100 pt-3 space-y-1">
              {hiddenHolidays.map((h) => (
                <li
                  key={h.id}
                  className="flex items-center gap-2 text-sm text-gray-700 py-1"
                >
                  <span>{h.emoji}</span>
                  <span>{isZh ? h.zh : h.en}</span>
                  <button
                    type="button"
                    onClick={() => restoreBuiltIn(h.id)}
                    className="ml-auto text-xs text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1"
                  >
                    <Eye className="w-3 h-3" /> {t('hidden.restore')}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <p className="text-xs text-gray-400 text-center">{t('disclaimer')}</p>
    </div>
  )
}

interface CountdownCardProps {
  item: {
    key: string
    name: string
    emoji: string
    isCustom: boolean
    isLunar: boolean
    customId?: string
    builtInId?: string
    next: Date | null
    remaining: Remaining | null
  }
  onHide: () => void
  onRemove: () => void
  isZh: boolean
  t: (k: string, opts?: Record<string, unknown>) => string
}
const CountdownCard: React.FC<CountdownCardProps> = ({ item, onHide, onRemove, isZh, t }) => {
  const r = item.remaining
  const dateStr = item.next
    ? `${item.next.getFullYear()}-${String(item.next.getMonth() + 1).padStart(2, '0')}-${String(item.next.getDate()).padStart(2, '0')}`
    : t('card.noDate')
  const weekday = item.next
    ? item.next.toLocaleDateString(isZh ? 'zh-CN' : 'en-US', { weekday: 'short' })
    : ''
  const accent =
    !r || r.totalMs > 7 * 24 * 3600 * 1000
      ? 'from-indigo-50 to-white border-indigo-200'
      : r.totalMs > 24 * 3600 * 1000
        ? 'from-amber-50 to-white border-amber-200'
        : 'from-rose-50 to-white border-rose-200'
  return (
    <div
      className={`rounded-2xl border bg-gradient-to-br ${accent} p-4 flex flex-col gap-2 relative`}
    >
      <div className="flex items-center gap-2">
        <span className="text-2xl leading-none">{item.emoji}</span>
        <span className="text-sm font-semibold text-gray-800 truncate flex-1">{item.name}</span>
        {item.isLunar && (
          <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-amber-100 text-amber-700 border border-amber-200 font-medium">
            {t('card.lunar')}
          </span>
        )}
        {item.isCustom ? (
          <button
            type="button"
            onClick={onRemove}
            className="text-gray-400 hover:text-red-500"
            title={t('card.remove')}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onHide}
            className="text-gray-400 hover:text-gray-700"
            title={t('card.hide')}
          >
            <EyeOff className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {r ? (
        <>
          <div className="flex items-baseline gap-1 text-gray-900 font-mono tabular-nums">
            <span className="text-3xl font-bold">{r.days}</span>
            <span className="text-xs text-gray-500">{t('card.days')}</span>
            <span className="text-sm font-semibold ml-2">
              {String(r.hours).padStart(2, '0')}:{String(r.minutes).padStart(2, '0')}
            </span>
          </div>
          <div className="text-xs text-gray-500 flex items-center gap-2">
            <span>{dateStr}</span>
            <span>·</span>
            <span>{weekday}</span>
            {r.days === 0 && r.totalMs > 0 && (
              <span className="ml-auto px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-medium">
                {t('card.today')}
              </span>
            )}
          </div>
        </>
      ) : (
        <div className="text-xs text-gray-400">{t('card.outOfRange')}</div>
      )}
    </div>
  )
}

export default HolidayCountdown
