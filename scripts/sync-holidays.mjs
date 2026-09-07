#!/usr/bin/env node
// 同步中国大陆法定节假日安排到 tools/tool-calendar/src/lib/statutoryHolidays.ts
// 用法：node scripts/sync-holidays.mjs 2024 2025 2026 2027
// 数据源：NateScarlet/holiday-cn（抓取国务院办公厅通知原文生成）
import { writeFileSync } from 'node:fs'

const years = process.argv.slice(2).map(Number)
if (!years.length) {
  console.error('用法：node scripts/sync-holidays.mjs <起始年> [...更多年份]')
  process.exit(1)
}

const OUT = new URL('../tools/tool-calendar/src/lib/statutoryHolidays.ts', import.meta.url)
const lines = []
const covered = []

for (const year of years) {
  const url = `https://raw.githubusercontent.com/NateScarlet/holiday-cn/master/${year}.json`
  const res = await fetch(url)
  if (!res.ok) {
    console.warn(`跳过 ${year}：HTTP ${res.status}`)
    continue
  }
  const data = await res.json()
  if (!data.days?.length) {
    console.warn(`跳过 ${year}：尚未发布放假安排`)
    continue
  }
  covered.push(year)
  lines.push(`  // ${year}：${data.papers[0]}`)
  for (const day of data.days) {
    lines.push(`  '${day.date}': ['${day.name}', ${day.isOffDay ? 1 : 0}],`)
  }
}

if (!covered.length) {
  console.error('没有任何年份可用，未写入文件')
  process.exit(1)
}

writeFileSync(
  OUT,
  `import type { HolidayPlan } from './types'

// 中国大陆法定节假日放假与调休安排（国务院办公厅逐年发布，无法算法推导，只能内置）
// 数据来源：https://github.com/NateScarlet/holiday-cn（每条注释即当年国务院通知原文链接）
// ponytail: 手工快照到 ${covered[covered.length - 1]} 年；国务院一般在前一年 11 月发布次年安排，
// 届时重跑 scripts/sync-holidays.mjs 追加即可，超出范围的年份只显示周末，不显示休/班。
// 1 = 放假, 0 = 调休上班
const RAW: Record<string, [string, 0 | 1]> = {
${lines.join('\n')}
}

export const HOLIDAY_YEAR_MIN = ${covered[0]}
export const HOLIDAY_YEAR_MAX = ${covered[covered.length - 1]}

/** 返回该日的法定节假日安排；无安排（含超出数据范围的年份）返回 null */
export function getHolidayPlan(dateKey: string): HolidayPlan | null {
  const hit = RAW[dateKey]
  if (!hit) return null
  return { name: hit[0], isOffDay: hit[1] === 1 }
}
`,
)
console.log(`已写入 ${covered.length} 年数据（${covered.join(', ')}）`)
