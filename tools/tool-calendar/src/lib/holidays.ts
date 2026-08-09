import type { LunarDate } from './types'
import { solarToLunar } from './lunar'

interface FixedHoliday {
  monthDay: string
  name: string
}

// 不含中国法定节假日调休（逐年人工公布，无法算法推导，超出 MVP 范围）
const FIXED_HOLIDAYS: FixedHoliday[] = [
  { monthDay: '01-01', name: '元旦' },
  { monthDay: '02-14', name: '情人节' },
  { monthDay: '03-08', name: '妇女节' },
  { monthDay: '05-01', name: '劳动节' },
  { monthDay: '06-01', name: '儿童节' },
  { monthDay: '10-01', name: '国庆节' },
  { monthDay: '10-31', name: '万圣节' },
  { monthDay: '12-25', name: '圣诞节' },
]

const LUNAR_FESTIVALS: Record<string, string> = {
  '1-1': '春节',
  '1-15': '元宵节',
  '5-5': '端午节',
  '7-7': '七夕',
  '8-15': '中秋节',
  '9-9': '重阳节',
  '12-8': '腊八节',
}

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

export function getFestival(date: Date, lunar: LunarDate): string | null {
  const monthDay = `${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
  const fixed = FIXED_HOLIDAYS.find((h) => h.monthDay === monthDay)
  if (fixed) return fixed.name

  if (lunar.isLeap) return null

  const lunarKey = `${lunar.month}-${lunar.day}`
  if (LUNAR_FESTIVALS[lunarKey]) return LUNAR_FESTIVALS[lunarKey]

  const tomorrow = new Date(date)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowLunar = solarToLunar(tomorrow)
  if (!tomorrowLunar.isLeap && tomorrowLunar.month === 1 && tomorrowLunar.day === 1) {
    return '除夕'
  }
  return null
}
