import React, { useMemo, useState } from 'react'
import { PageHero, ParticlesBackground } from '@toolbox/ui-kit'
import { useTranslation } from 'react-i18next'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import { solarToLunar } from './lib/lunar'
import { getSolarTerm } from './lib/solarTerm'
import { getFestival } from './lib/holidays'
import type { LunarDate } from './lib/types'

interface DayCell {
  date: Date
  day: number
  lunar: LunarDate
  solarTerm: string | null
  festival: string | null
  isToday: boolean
}

const WEEKDAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function buildMonth(year: number, month: number, todayKey: string): DayCell[] {
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: DayCell[] = []
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day)
    const lunar = solarToLunar(date)
    cells.push({
      date,
      day,
      lunar,
      solarTerm: getSolarTerm(date),
      festival: getFestival(date, lunar),
      isToday: toDateKey(date) === todayKey,
    })
  }
  return cells
}

const Calendar: React.FC = () => {
  const { t } = useTranslation('toolCalendar')
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selected, setSelected] = useState<DayCell | null>(null)

  const todayKey = toDateKey(today)
  const cells = useMemo(() => buildMonth(year, month, todayKey), [year, month, todayKey])
  const leadingBlanks = new Date(year, month, 1).getDay()

  const goToMonth = (delta: number) => {
    const d = new Date(year, month + delta, 1)
    setYear(d.getFullYear())
    setMonth(d.getMonth())
    setSelected(null)
  }

  const goToToday = () => {
    setYear(today.getFullYear())
    setMonth(today.getMonth())
    setSelected(null)
  }

  return (
    <div className="relative min-h-[60vh]">
      <ParticlesBackground preset="minimal" className="absolute inset-0" />
      <div className="relative z-10 max-w-3xl mx-auto space-y-6">
        <PageHero title={t('title')} description={t('description')} icon={CalendarIcon} />

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={() => goToMonth(-1)}
              aria-label={t('prev_month')}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {t('month_title', { year, month: month + 1 })}
              </h2>
              <button
                type="button"
                onClick={goToToday}
                className="px-3 py-1 text-xs font-medium rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300"
              >
                {t('today')}
              </button>
            </div>
            <button
              type="button"
              onClick={() => goToMonth(1)}
              aria-label={t('next_month')}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            {WEEKDAY_KEYS.map((wd) => (
              <div key={wd} className="py-1">{t(`weekday_${wd}`)}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: leadingBlanks }, (_, i) => (
              <div key={`blank-${i}`} />
            ))}
            {cells.map((cell) => {
              const label = cell.festival ?? cell.solarTerm ?? cell.lunar.dayName
              const highlighted = Boolean(cell.festival || cell.solarTerm)
              return (
                <button
                  key={cell.day}
                  type="button"
                  onClick={() => setSelected(cell)}
                  className={`flex flex-col items-center rounded-lg py-2 text-sm transition-colors ${
                    cell.isToday
                      ? 'bg-indigo-600 text-white'
                      : selected?.day === cell.day
                        ? 'bg-indigo-50 dark:bg-indigo-900/30'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700/40'
                  }`}
                >
                  <span className={cell.isToday ? 'text-white font-semibold' : 'text-gray-800 dark:text-gray-100 font-medium'}>
                    {cell.day}
                  </span>
                  <span
                    className={`text-[10px] mt-0.5 ${
                      cell.isToday
                        ? 'text-indigo-100'
                        : highlighted
                          ? 'text-rose-500 dark:text-rose-400'
                          : 'text-gray-400 dark:text-gray-500'
                    }`}
                  >
                    {label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {selected && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">{t('detail_title')}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">{t('detail_solar')}</span>
                <span className="text-gray-900 dark:text-gray-100 font-medium">
                  {t('month_title', { year, month: month + 1 })} {selected.day} {t(`weekday_${WEEKDAY_KEYS[selected.date.getDay()]}`)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">{t('detail_lunar')}</span>
                <span className="text-gray-900 dark:text-gray-100 font-medium">
                  {selected.lunar.year} {selected.lunar.monthName}{selected.lunar.dayName}
                </span>
              </div>
              {selected.solarTerm && (
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">{t('detail_solar_term')}</span>
                  <span className="text-rose-500 dark:text-rose-400 font-medium">{selected.solarTerm}</span>
                </div>
              )}
              {selected.festival && (
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">{t('detail_festival')}</span>
                  <span className="text-rose-500 dark:text-rose-400 font-medium">{selected.festival}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Calendar
