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
