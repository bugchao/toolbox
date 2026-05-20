// 内置节日数据
// - gregorian：固定公历日（如元旦 1/1）
// - lunar：基于农历计算，预存 2026–2030 五年的公历对照表，超出范围则隐藏
// 数据为人工整理，可能与权威发布相差 ±1 日；用户可自行添加自定义日期纠正

export interface Holiday {
  id: string
  zh: string
  en: string
  emoji: string
  type: 'gregorian' | 'lunar'
  // gregorian 用 monthDay = 'MM-DD'
  monthDay?: string
  // lunar 用年→公历 ISO 日期映射
  dates?: Record<number, string>
}

export const BUILT_IN_HOLIDAYS: Holiday[] = [
  // ── 公历固定 ──
  { id: 'new-year', zh: '元旦', en: "New Year's Day", emoji: '🎊', type: 'gregorian', monthDay: '01-01' },
  { id: 'valentine', zh: '情人节', en: "Valentine's Day", emoji: '💝', type: 'gregorian', monthDay: '02-14' },
  { id: 'womens-day', zh: '妇女节', en: "Women's Day", emoji: '🌷', type: 'gregorian', monthDay: '03-08' },
  { id: 'qingming', zh: '清明节', en: 'Qingming Festival', emoji: '🌿', type: 'gregorian', monthDay: '04-05' },
  { id: 'labor-day', zh: '劳动节', en: 'Labor Day', emoji: '👷', type: 'gregorian', monthDay: '05-01' },
  { id: 'youth-day', zh: '青年节', en: 'Youth Day', emoji: '🧑‍🎓', type: 'gregorian', monthDay: '05-04' },
  { id: 'childrens-day', zh: '儿童节', en: "Children's Day", emoji: '🧒', type: 'gregorian', monthDay: '06-01' },
  { id: 'party-day', zh: '建党节', en: 'CPC Founding Day', emoji: '🚩', type: 'gregorian', monthDay: '07-01' },
  { id: 'army-day', zh: '建军节', en: 'PLA Day', emoji: '🪖', type: 'gregorian', monthDay: '08-01' },
  { id: 'teachers-day', zh: '教师节', en: "Teachers' Day", emoji: '👩‍🏫', type: 'gregorian', monthDay: '09-10' },
  { id: 'national-day', zh: '国庆节', en: 'National Day', emoji: '🇨🇳', type: 'gregorian', monthDay: '10-01' },
  { id: 'halloween', zh: '万圣节', en: 'Halloween', emoji: '🎃', type: 'gregorian', monthDay: '10-31' },
  { id: 'singles-day', zh: '光棍节 / 双 11', en: 'Singles Day / 11.11', emoji: '🛒', type: 'gregorian', monthDay: '11-11' },
  { id: 'twin-twelve', zh: '双 12', en: '12.12', emoji: '🛍️', type: 'gregorian', monthDay: '12-12' },
  { id: 'christmas-eve', zh: '平安夜', en: 'Christmas Eve', emoji: '🌃', type: 'gregorian', monthDay: '12-24' },
  { id: 'christmas', zh: '圣诞节', en: 'Christmas', emoji: '🎄', type: 'gregorian', monthDay: '12-25' },

  // ── 农历（2026–2030 公历对照表）──
  {
    id: 'spring-festival',
    zh: '春节（正月初一）',
    en: 'Spring Festival',
    emoji: '🧧',
    type: 'lunar',
    dates: {
      2026: '2026-02-17',
      2027: '2027-02-06',
      2028: '2028-01-26',
      2029: '2029-02-13',
      2030: '2030-02-03',
    },
  },
  {
    id: 'lantern-festival',
    zh: '元宵节（正月十五）',
    en: 'Lantern Festival',
    emoji: '🏮',
    type: 'lunar',
    dates: {
      2026: '2026-03-03',
      2027: '2027-02-20',
      2028: '2028-02-09',
      2029: '2029-02-27',
      2030: '2030-02-17',
    },
  },
  {
    id: 'dragon-head',
    zh: '龙抬头（二月初二）',
    en: 'Dragon Head Festival',
    emoji: '🐲',
    type: 'lunar',
    dates: {
      2026: '2026-03-20',
      2027: '2027-03-09',
      2028: '2028-02-27',
      2029: '2029-03-16',
      2030: '2030-03-06',
    },
  },
  {
    id: 'dragon-boat',
    zh: '端午节（五月初五）',
    en: 'Dragon Boat Festival',
    emoji: '🐉',
    type: 'lunar',
    dates: {
      2026: '2026-06-19',
      2027: '2027-06-09',
      2028: '2028-05-28',
      2029: '2029-06-16',
      2030: '2030-06-05',
    },
  },
  {
    id: 'qixi',
    zh: '七夕（七月初七）',
    en: 'Qixi Festival',
    emoji: '🌌',
    type: 'lunar',
    dates: {
      2026: '2026-08-19',
      2027: '2027-08-08',
      2028: '2028-07-28',
      2029: '2029-08-16',
      2030: '2030-08-05',
    },
  },
  {
    id: 'mid-autumn',
    zh: '中秋节（八月十五）',
    en: 'Mid-Autumn Festival',
    emoji: '🌕',
    type: 'lunar',
    dates: {
      2026: '2026-09-25',
      2027: '2027-09-15',
      2028: '2028-09-03',
      2029: '2029-09-22',
      2030: '2030-09-12',
    },
  },
  {
    id: 'double-ninth',
    zh: '重阳节（九月初九）',
    en: 'Double Ninth Festival',
    emoji: '🍂',
    type: 'lunar',
    dates: {
      2026: '2026-10-18',
      2027: '2027-10-08',
      2028: '2028-09-26',
      2029: '2029-10-15',
      2030: '2030-10-05',
    },
  },
  {
    id: 'laba',
    zh: '腊八节（腊月初八）',
    en: 'Laba Festival',
    emoji: '🥣',
    type: 'lunar',
    dates: {
      2026: '2026-01-26',
      2027: '2027-01-15',
      2028: '2028-01-04',
      2029: '2029-01-22',
      2030: '2030-01-11',
    },
  },
]

/**
 * 给定今天日期，返回 holiday 的下一次发生日期；若没有可计算的未来日期返回 null
 */
export function getNextOccurrence(holiday: Holiday, now: Date): Date | null {
  if (holiday.type === 'gregorian' && holiday.monthDay) {
    const [m, d] = holiday.monthDay.split('-').map(Number)
    const year = now.getFullYear()
    const thisYear = new Date(year, m - 1, d)
    // 今天/未来当年仍有效
    if (thisYear.getTime() >= startOfDay(now).getTime()) return thisYear
    return new Date(year + 1, m - 1, d)
  }
  if (holiday.type === 'lunar' && holiday.dates) {
    const today = startOfDay(now)
    const sorted = Object.entries(holiday.dates)
      .map(([y, iso]) => ({ year: Number(y), date: parseIso(iso) }))
      .sort((a, b) => a.date.getTime() - b.date.getTime())
    const next = sorted.find(({ date }) => date.getTime() >= today.getTime())
    return next?.date ?? null
  }
  return null
}

export function parseIso(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

export function toIso(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}

// ─────────────────────────────────────────────────────────────
// 农历 ↔ 公历 转换数据（2026–2030 五年范围）
// 每年记录：lunar new-year 的公历日期、各月天数（29 或 30）、闰月位置
// 数据通过已知节日 LUT 反推 + 标准农历参考整理，可能与权威发布相差 ±1 日
// ─────────────────────────────────────────────────────────────

export interface LunarYearData {
  newYear: string // 'YYYY-MM-DD'：lunar 1-1 对应的公历
  // 各月长度（29/30）。无闰月时长度 12；有闰月时长度 13，闰月插在 leapMonth 之后
  monthDays: number[]
  // 0 = 无闰月；1-12 = 闰几月（闰月排在该月之后）
  leapMonth: number
}

export const LUNAR_YEARS: Record<number, LunarYearData> = {
  2026: { newYear: '2026-02-17', monthDays: [30, 29, 30, 29, 30, 29, 29, 29, 30, 30, 29, 30], leapMonth: 0 },
  2027: { newYear: '2027-02-06', monthDays: [29, 30, 29, 30, 30, 29, 30, 29, 30, 29, 30, 29], leapMonth: 0 },
  // 2028 是闰年（闰五月，年总 384 天）
  2028: { newYear: '2028-01-26', monthDays: [30, 29, 30, 29, 30, 30, 29, 30, 29, 30, 29, 30, 29], leapMonth: 5 },
  2029: { newYear: '2029-02-13', monthDays: [29, 30, 30, 29, 30, 29, 30, 29, 30, 30, 29, 30], leapMonth: 0 },
  2030: { newYear: '2030-02-03', monthDays: [29, 30, 29, 30, 29, 30, 29, 30, 30, 29, 30, 29], leapMonth: 0 },
}

export const LUNAR_YEAR_MIN = 2026
export const LUNAR_YEAR_MAX = 2030

/**
 * 农历日期 → 公历 Date
 * @param year   农历年（必须在 LUNAR_YEARS 范围内）
 * @param month  农历月（1-12，不含闰月本身——闰月作为独立机制处理）
 * @param day    农历日（1-30）
 * @returns 对应公历 Date；超出数据范围或日不存在则返回 null
 */
export function lunarToGregorian(year: number, month: number, day: number): Date | null {
  const data = LUNAR_YEARS[year]
  if (!data) return null
  if (month < 1 || month > 12) return null
  if (day < 1 || day > 30) return null

  // 闰年时月数组长 13，闰月夹在 leapMonth 之后；普通月 idx：m≤leapMonth 用 m-1，否则用 m（跳过闰月槽位）
  let idx: number
  if (data.leapMonth > 0 && month > data.leapMonth) {
    idx = month
  } else {
    idx = month - 1
  }

  if (idx >= data.monthDays.length) return null
  if (day > data.monthDays[idx]) return null

  let offset = 0
  for (let i = 0; i < idx; i++) offset += data.monthDays[i]
  offset += day - 1

  const [y, m, d] = data.newYear.split('-').map(Number)
  const result = new Date(y, m - 1, d)
  result.setDate(result.getDate() + offset)
  return result
}

/**
 * 找到农历(月,日)在 LUNAR_YEAR_MIN..LUNAR_YEAR_MAX 范围内、首个 ≥ today 的公历 Date
 */
export function nextLunarOccurrence(month: number, day: number, today: Date): Date | null {
  const ref = startOfDay(today)
  for (let y = ref.getFullYear(); y <= LUNAR_YEAR_MAX; y++) {
    if (y < LUNAR_YEAR_MIN) continue
    const d = lunarToGregorian(y, month, day)
    if (d && d.getTime() >= ref.getTime()) return d
  }
  return null
}

const LUNAR_MONTH_NAMES_ZH = ['正月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '腊月']
const LUNAR_DAY_NAMES_ZH = [
  '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
  '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
  '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十',
]
export function lunarMonthName(month: number, lang: 'zh' | 'en' = 'zh'): string {
  if (lang === 'zh') return LUNAR_MONTH_NAMES_ZH[month - 1] ?? `${month}月`
  return `Lunar M${month}`
}
export function lunarDayName(day: number, lang: 'zh' | 'en' = 'zh'): string {
  if (lang === 'zh') return LUNAR_DAY_NAMES_ZH[day - 1] ?? `${day}日`
  return `D${day}`
}

/**
 * 内置节日：从 today 起返回 maxYears 年内的所有未来公历日期（升序）
 */
export function builtInSchedule(h: Holiday, today: Date, maxYears = 10): Date[] {
  const t = startOfDay(today).getTime()
  if (h.type === 'gregorian' && h.monthDay) {
    const [m, d] = h.monthDay.split('-').map(Number)
    const out: Date[] = []
    const startYear = new Date(t).getFullYear()
    for (let y = startYear; y < startYear + maxYears; y++) {
      const cand = new Date(y, m - 1, d)
      if (cand.getTime() >= t) out.push(cand)
    }
    return out
  }
  if (h.type === 'lunar' && h.dates) {
    return Object.values(h.dates)
      .map(parseIso)
      .filter((d) => d.getTime() >= t)
      .sort((a, b) => a.getTime() - b.getTime())
  }
  return []
}

/**
 * 计算 from→to 之间的剩余时长，按 天/时/分/秒 分解
 */
export interface Remaining {
  totalMs: number
  days: number
  hours: number
  minutes: number
  seconds: number
  isPast: boolean
}
export function computeRemaining(target: Date, now: Date): Remaining {
  const totalMs = target.getTime() - now.getTime()
  const abs = Math.max(0, totalMs)
  const days = Math.floor(abs / (24 * 3600 * 1000))
  const hours = Math.floor((abs / (3600 * 1000)) % 24)
  const minutes = Math.floor((abs / (60 * 1000)) % 60)
  const seconds = Math.floor((abs / 1000) % 60)
  return { totalMs, days, hours, minutes, seconds, isPast: totalMs < 0 }
}
