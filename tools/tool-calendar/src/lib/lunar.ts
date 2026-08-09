import type { LunarDate } from './types'

// ponytail: 农历换算复用浏览器/Node 内置 ICU 的 Intl chinese calendar（V8/ICU 实现，
// 比手抄一份 1900-2100 年农历数据表更可靠），不再自建数据表。
const FORMATTER = new Intl.DateTimeFormat('en-US-u-ca-chinese', {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
})

const DAY_NAMES = [
  '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
  '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
  '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十',
]

const MONTH_NAMES = ['正月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '冬月', '腊月']

export function solarToLunar(date: Date): LunarDate {
  const parts = FORMATTER.formatToParts(date)
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? ''
  const monthRaw = get('month')
  const isLeap = monthRaw.endsWith('bis')
  const month = parseInt(monthRaw, 10)
  const day = parseInt(get('day'), 10)
  const year = parseInt(get('relatedYear'), 10)
  return {
    year,
    month,
    day,
    isLeap,
    dayName: DAY_NAMES[day - 1] ?? '',
    monthName: (isLeap ? '闰' : '') + (MONTH_NAMES[month - 1] ?? ''),
  }
}
