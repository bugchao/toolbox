import React, { useMemo, useState } from 'react'
import { PageHero, ParticlesBackground } from '@toolbox/ui-kit'
import { useTranslation } from 'react-i18next'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import { buildDay, buildMonthGrid, buildRange, startOfWeek, toDateKey } from './lib/days'
import { getHolidayPlan } from './lib/statutoryHolidays'
import type { DayCell } from './lib/types'

type ViewMode = 'day' | 'week' | 'month' | 'year'

const VIEWS: ViewMode[] = ['day', 'week', 'month', 'year']
const WEEKDAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
const CARD = 'bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700'

/** 单元格副标题：节日 > 节气 > 农历日 */
function subLabel(cell: DayCell): string {
  return cell.festival ?? cell.solarTerm ?? cell.lunar.dayName
}

const Calendar: React.FC = () => {
  const { t } = useTranslation('toolCalendar')
  const today = useMemo(() => new Date(), [])
  const todayKey = toDateKey(today)

  const [view, setView] = useState<ViewMode>('month')
  const [cursor, setCursor] = useState<Date>(today)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const year = cursor.getFullYear()
  const month = cursor.getMonth()

  const monthCells = useMemo(
    () => (view === 'month' ? buildMonthGrid(year, month, todayKey) : []),
    [view, year, month, todayKey],
  )
  const weekCells = useMemo(
    () => (view === 'week' ? buildRange(startOfWeek(cursor), 7, todayKey) : []),
    [view, cursor, todayKey],
  )
  const dayCell = useMemo(() => buildDay(cursor, todayKey), [cursor, todayKey])

  const detail = useMemo(() => {
    if (view === 'day') return dayCell
    return selectedDate ? buildDay(selectedDate, todayKey) : null
  }, [view, dayCell, selectedDate, todayKey])

  /** 按当前视图单位前后翻页 */
  const step = (delta: number) => {
    const d = new Date(cursor)
    if (view === 'day') d.setDate(d.getDate() + delta)
    else if (view === 'week') d.setDate(d.getDate() + delta * 7)
    else if (view === 'month') d.setMonth(d.getMonth() + delta, 1)
    else d.setFullYear(d.getFullYear() + delta, 0, 1)
    setCursor(d)
    setSelectedDate(null)
  }

  const goToToday = () => {
    setCursor(today)
    setSelectedDate(view === 'month' || view === 'week' ? today : null)
  }

  const title = () => {
    if (view === 'day') return t('day_title', { year, month: month + 1, day: cursor.getDate() })
    if (view === 'week') {
      const from = startOfWeek(cursor)
      const to = new Date(from.getFullYear(), from.getMonth(), from.getDate() + 6)
      return t('week_title', {
        fromMonth: from.getMonth() + 1,
        fromDay: from.getDate(),
        toMonth: to.getMonth() + 1,
        toDay: to.getDate(),
        year: to.getFullYear(),
      })
    }
    if (view === 'month') return t('month_title', { year, month: month + 1 })
    return t('year_title', { year })
  }

  return (
    <div className="relative min-h-[60vh]">
      <ParticlesBackground preset="minimal" className="absolute inset-0" />
      <div className="relative z-10 max-w-4xl mx-auto space-y-6">
        <PageHero title={t('title')} description={t('description')} icon={CalendarIcon} />

        <div className={`${CARD} p-4 sm:p-6`}>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => step(-1)}
                aria-label={t('prev')}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 min-w-[9rem] text-center">
                {title()}
              </h2>
              <button
                type="button"
                onClick={() => step(1)}
                aria-label={t('next')}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
              <button
                type="button"
                onClick={goToToday}
                className="ml-1 px-3 py-1 text-xs font-medium rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300"
              >
                {t('today')}
              </button>
            </div>

            <div className="inline-flex rounded-lg bg-gray-100 dark:bg-gray-700/50 p-0.5" role="tablist">
              {VIEWS.map((v) => (
                <button
                  key={v}
                  type="button"
                  role="tab"
                  aria-selected={view === v}
                  onClick={() => {
                    setView(v)
                    setSelectedDate(null)
                  }}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    view === v
                      ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-300 shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
                >
                  {t(`view_${v}`)}
                </button>
              ))}
            </div>
          </div>

          {view === 'month' && (
            <MonthGrid
              cells={monthCells}
              month={month}
              selectedKey={selectedDate ? toDateKey(selectedDate) : null}
              onSelect={setSelectedDate}
              t={t}
            />
          )}
          {view === 'week' && (
            <WeekStrip
              cells={weekCells}
              selectedKey={selectedDate ? toDateKey(selectedDate) : null}
              onSelect={setSelectedDate}
              t={t}
            />
          )}
          {view === 'day' && <DayPanel cell={dayCell} t={t} />}
          {view === 'year' && (
            <YearGrid
              year={year}
              todayKey={todayKey}
              t={t}
              onPickMonth={(m) => {
                setCursor(new Date(year, m, 1))
                setView('month')
                setSelectedDate(null)
              }}
            />
          )}
        </div>

        {view !== 'day' && detail && <DetailCard cell={detail} t={t} />}
      </div>
    </div>
  )
}

type T = (key: string, opts?: Record<string, unknown>) => string

/** 休/班 角标 */
const HolidayBadge: React.FC<{ cell: DayCell; t: T }> = ({ cell, t }) => {
  if (!cell.holiday) return null
  return (
    <span
      title={cell.holiday.name}
      className={`absolute top-0.5 right-0.5 px-1 rounded text-[9px] leading-tight font-medium ${
        cell.holiday.isOffDay
          ? 'bg-rose-500 text-white'
          : 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200'
      }`}
    >
      {t(cell.holiday.isOffDay ? 'badge_off' : 'badge_work')}
    </span>
  )
}

const MonthGrid: React.FC<{
  cells: DayCell[]
  month: number
  selectedKey: string | null
  onSelect: (d: Date) => void
  t: T
}> = ({ cells, month, selectedKey, onSelect, t }) => (
  <>
    <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
      {WEEKDAY_KEYS.map((wd) => (
        <div key={wd} className="py-1">{t(`weekday_${wd}`)}</div>
      ))}
    </div>
    <div className="grid grid-cols-7 gap-1">
      {cells.map((cell) => {
        const outside = cell.date.getMonth() !== month
        const rest = cell.holiday?.isOffDay ?? cell.isWeekend
        return (
          <button
            key={cell.key}
            type="button"
            onClick={() => onSelect(cell.date)}
            className={`relative flex flex-col items-center rounded-lg py-2 text-sm transition-colors ${
              outside ? 'opacity-40' : ''
            } ${
              cell.isToday
                ? 'bg-indigo-600 text-white'
                : selectedKey === cell.key
                  ? 'bg-indigo-50 dark:bg-indigo-900/30'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700/40'
            }`}
          >
            <HolidayBadge cell={cell} t={t} />
            <span
              className={`font-medium ${
                cell.isToday
                  ? 'text-white'
                  : rest
                    ? 'text-rose-500 dark:text-rose-400'
                    : 'text-gray-800 dark:text-gray-100'
              }`}
            >
              {cell.day}
            </span>
            <span
              className={`text-[10px] mt-0.5 truncate max-w-full px-0.5 ${
                cell.isToday
                  ? 'text-indigo-100'
                  : cell.festival || cell.solarTerm
                    ? 'text-rose-500 dark:text-rose-400'
                    : 'text-gray-400 dark:text-gray-500'
              }`}
            >
              {subLabel(cell)}
            </span>
          </button>
        )
      })}
    </div>
  </>
)

const WeekStrip: React.FC<{
  cells: DayCell[]
  selectedKey: string | null
  onSelect: (d: Date) => void
  t: T
}> = ({ cells, selectedKey, onSelect, t }) => (
  <div className="grid grid-cols-7 gap-1">
    {cells.map((cell) => (
      <button
        key={cell.key}
        type="button"
        onClick={() => onSelect(cell.date)}
        className={`relative flex flex-col items-center gap-1 rounded-lg py-3 min-h-[7rem] transition-colors ${
          cell.isToday
            ? 'bg-indigo-600 text-white'
            : selectedKey === cell.key
              ? 'bg-indigo-50 dark:bg-indigo-900/30'
              : 'hover:bg-gray-50 dark:hover:bg-gray-700/40'
        }`}
      >
        <HolidayBadge cell={cell} t={t} />
        <span className={`text-[11px] ${cell.isToday ? 'text-indigo-100' : 'text-gray-500 dark:text-gray-400'}`}>
          {t(`weekday_${WEEKDAY_KEYS[cell.date.getDay()]}`)}
        </span>
        <span
          className={`text-xl font-semibold ${
            cell.isToday
              ? 'text-white'
              : (cell.holiday?.isOffDay ?? cell.isWeekend)
                ? 'text-rose-500 dark:text-rose-400'
                : 'text-gray-800 dark:text-gray-100'
          }`}
        >
          {cell.day}
        </span>
        <span className={`text-[10px] ${cell.isToday ? 'text-indigo-100' : 'text-gray-400 dark:text-gray-500'}`}>
          {cell.lunar.dayName}
        </span>
        {(cell.festival || cell.solarTerm) && (
          <span
            className={`text-[10px] px-1 text-center ${cell.isToday ? 'text-indigo-100' : 'text-rose-500 dark:text-rose-400'}`}
          >
            {cell.festival ?? cell.solarTerm}
          </span>
        )}
      </button>
    ))}
  </div>
)

const DayPanel: React.FC<{ cell: DayCell; t: T }> = ({ cell, t }) => (
  <div className="flex flex-col items-center py-8 gap-2">
    <span className="text-sm text-gray-500 dark:text-gray-400">
      {t(`weekday_full_${WEEKDAY_KEYS[cell.date.getDay()]}`)}
    </span>
    <span
      className={`text-7xl font-bold ${
        cell.isToday
          ? 'text-indigo-600 dark:text-indigo-400'
          : (cell.holiday?.isOffDay ?? cell.isWeekend)
            ? 'text-rose-500 dark:text-rose-400'
            : 'text-gray-900 dark:text-gray-100'
      }`}
    >
      {cell.day}
    </span>
    <span className="text-base text-gray-700 dark:text-gray-300">
      {cell.lunar.monthName}
      {cell.lunar.dayName}
    </span>
    <div className="flex flex-wrap justify-center gap-2 mt-2">
      {cell.festival && <Tag text={cell.festival} tone="rose" />}
      {cell.solarTerm && <Tag text={cell.solarTerm} tone="amber" />}
      {cell.holiday && (
        <Tag
          text={`${cell.holiday.name} · ${t(cell.holiday.isOffDay ? 'plan_off' : 'plan_work')}`}
          tone={cell.holiday.isOffDay ? 'rose' : 'gray'}
        />
      )}
    </div>
  </div>
)

const Tag: React.FC<{ text: string; tone: 'rose' | 'amber' | 'gray' }> = ({ text, tone }) => {
  const tones = {
    rose: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-300',
    amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
    gray: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300',
  }
  return <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${tones[tone]}`}>{text}</span>
}

/** 年视图：12 个迷你月历，只算节假日不算农历（365 天的农历换算太慢） */
const YearGrid: React.FC<{ year: number; todayKey: string; t: T; onPickMonth: (m: number) => void }> = ({
  year,
  todayKey,
  t,
  onPickMonth,
}) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
    {Array.from({ length: 12 }, (_, m) => {
      const blanks = new Date(year, m, 1).getDay()
      const daysInMonth = new Date(year, m + 1, 0).getDate()
      return (
        <button
          key={m}
          type="button"
          onClick={() => onPickMonth(m)}
          className="rounded-lg p-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors"
        >
          <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1 px-1">
            {t('short_month', { month: m + 1 })}
          </div>
          <div className="grid grid-cols-7 gap-px text-center text-[9px] text-gray-400 dark:text-gray-500">
            {WEEKDAY_KEYS.map((wd) => (
              <div key={wd}>{t(`weekday_narrow_${wd}`)}</div>
            ))}
            {Array.from({ length: blanks }, (_, i) => <div key={`b${i}`} />)}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1
              const key = `${year}-${String(m + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
              const weekday = new Date(year, m, day).getDay()
              const plan = getHolidayPlan(key)
              const rest = plan ? plan.isOffDay : weekday === 0 || weekday === 6
              return (
                <div
                  key={day}
                  title={plan?.name}
                  className={`text-[10px] leading-4 rounded-sm ${
                    key === todayKey
                      ? 'bg-indigo-600 text-white font-semibold'
                      : rest
                        ? 'text-rose-500 dark:text-rose-400'
                        : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {day}
                </div>
              )
            })}
          </div>
        </button>
      )
    })}
  </div>
)

const DetailCard: React.FC<{ cell: DayCell; t: T }> = ({ cell, t }) => (
  <div className={`${CARD} p-6`}>
    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">{t('detail_title')}</h3>
    <div className="space-y-2 text-sm">
      <Row label={t('detail_solar')}>
        {t('day_title', {
          year: cell.date.getFullYear(),
          month: cell.date.getMonth() + 1,
          day: cell.day,
        })}{' '}
        {t(`weekday_full_${WEEKDAY_KEYS[cell.date.getDay()]}`)}
      </Row>
      <Row label={t('detail_lunar')}>
        {cell.lunar.year} {cell.lunar.monthName}
        {cell.lunar.dayName}
      </Row>
      {cell.solarTerm && (
        <Row label={t('detail_solar_term')} accent>
          {cell.solarTerm}
        </Row>
      )}
      {cell.festival && (
        <Row label={t('detail_festival')} accent>
          {cell.festival}
        </Row>
      )}
      {cell.holiday && (
        <Row label={t('detail_holiday')} accent={cell.holiday.isOffDay}>
          {cell.holiday.name} · {t(cell.holiday.isOffDay ? 'plan_off' : 'plan_work')}
        </Row>
      )}
    </div>
  </div>
)

const Row: React.FC<{ label: string; accent?: boolean; children: React.ReactNode }> = ({
  label,
  accent,
  children,
}) => (
  <div className="flex justify-between gap-4">
    <span className="text-gray-500 dark:text-gray-400 shrink-0">{label}</span>
    <span
      className={`font-medium text-right ${
        accent ? 'text-rose-500 dark:text-rose-400' : 'text-gray-900 dark:text-gray-100'
      }`}
    >
      {children}
    </span>
  </div>
)

export default Calendar
