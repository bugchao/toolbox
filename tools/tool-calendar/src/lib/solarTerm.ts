// ponytail: 近似天文算法（回归年长度 + 年度偏移常数），精度 ±1 日；
// 需要天文台级精度时换成 VSOP87 太阳视黄经计算。
const TERM_NAMES = [
  '小寒', '大寒', '立春', '雨水', '惊蛰', '春分', '清明', '谷雨',
  '立夏', '小满', '芒种', '夏至', '小暑', '大暑', '立秋', '处暑',
  '白露', '秋分', '寒露', '霜降', '立冬', '小雪', '大雪', '冬至',
]

const TERM_OFFSET_MINUTES = [
  0, 21208, 42467, 63836, 85337, 107014, 128867, 150921,
  173149, 195551, 218072, 240693, 263343, 285989, 308563, 331033,
  353350, 375494, 397447, 419210, 440795, 462224, 483532, 504758,
]

const BASE_UTC_MS = Date.UTC(1900, 0, 6, 2, 5)
const TROPICAL_YEAR_MS = 31556925974.7
const BEIJING_OFFSET_MS = 8 * 3600 * 1000

function termDateKey(year: number, termIndex: number): string {
  const utcMs = BASE_UTC_MS + TROPICAL_YEAR_MS * (year - 1900) + TERM_OFFSET_MINUTES[termIndex] * 60000
  const beijing = new Date(utcMs + BEIJING_OFFSET_MS)
  return `${beijing.getUTCFullYear()}-${beijing.getUTCMonth() + 1}-${beijing.getUTCDate()}`
}

function dateKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
}

export function getSolarTerm(date: Date): string | null {
  const key = dateKey(date)
  const year = date.getFullYear()
  for (let i = 0; i < 24; i++) {
    if (termDateKey(year, i) === key) return TERM_NAMES[i]
  }
  return null
}
