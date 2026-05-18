// 中国个税 — 综合所得 7 级超额累进税率（年度应纳税所得额）
// 来源：国家税务总局，2019 年起施行
export interface Bracket {
  upper: number // 上限（含），最高档为 Infinity
  rate: number  // 税率
  deduct: number // 速算扣除数
}

export const ANNUAL_BRACKETS: Bracket[] = [
  { upper: 36000, rate: 0.03, deduct: 0 },
  { upper: 144000, rate: 0.10, deduct: 2520 },
  { upper: 300000, rate: 0.20, deduct: 16920 },
  { upper: 420000, rate: 0.25, deduct: 31920 },
  { upper: 660000, rate: 0.30, deduct: 52920 },
  { upper: 960000, rate: 0.35, deduct: 85920 },
  { upper: Infinity, rate: 0.45, deduct: 181920 },
]

// 年终奖（全年一次性奖金）单独计税 — 按月度数（奖金 ÷ 12）查 7 级税率
export const BONUS_BRACKETS: Bracket[] = [
  { upper: 3000, rate: 0.03, deduct: 0 },
  { upper: 12000, rate: 0.10, deduct: 210 },
  { upper: 25000, rate: 0.20, deduct: 1410 },
  { upper: 35000, rate: 0.25, deduct: 2660 },
  { upper: 55000, rate: 0.30, deduct: 4410 },
  { upper: 80000, rate: 0.35, deduct: 7160 },
  { upper: Infinity, rate: 0.45, deduct: 15160 },
]

// 基本减除费用：60000 / 年（5000 / 月）
export const MONTHLY_BASIC_DEDUCT = 5000

export function calcTaxByBrackets(taxable: number, brackets: Bracket[]): {
  tax: number
  rate: number
  deduct: number
} {
  if (taxable <= 0) return { tax: 0, rate: 0, deduct: 0 }
  for (const b of brackets) {
    if (taxable <= b.upper) {
      const tax = taxable * b.rate - b.deduct
      return { tax: Math.max(0, tax), rate: b.rate, deduct: b.deduct }
    }
  }
  return { tax: 0, rate: 0, deduct: 0 }
}

// 综合所得年度税
export function calcAnnualIIT(taxable: number) {
  return calcTaxByBrackets(taxable, ANNUAL_BRACKETS)
}

// 年终奖单独计税（一次性奖金）
export function calcBonusSingleIIT(bonus: number) {
  if (bonus <= 0) return { tax: 0, rate: 0, deduct: 0 }
  const monthly = bonus / 12
  for (const b of BONUS_BRACKETS) {
    if (monthly <= b.upper) {
      const tax = bonus * b.rate - b.deduct
      return { tax: Math.max(0, tax), rate: b.rate, deduct: b.deduct }
    }
  }
  return { tax: 0, rate: 0, deduct: 0 }
}

// 月度累计预扣预缴：给定 12 月的税前工资、五险一金、月度专项附加扣除（数组），
// 计算每月当月应缴预扣预缴税额（累计预扣模型）
export interface MonthRow {
  month: number
  pretax: number
  insurance: number
  itemized: number
  cumulativePretax: number
  cumulativeTaxable: number
  cumulativeTaxDue: number
  monthlyTax: number
  takeHome: number
}

export function calcMonthlyWithholding(
  pretaxMonthly: number[],
  insuranceMonthly: number[],
  itemizedMonthly: number[],
): MonthRow[] {
  const rows: MonthRow[] = []
  let cumulativePretax = 0
  let cumulativeInsurance = 0
  let cumulativeItemized = 0
  let cumulativeTaxPaid = 0
  for (let i = 0; i < 12; i++) {
    const pretax = pretaxMonthly[i] ?? 0
    const insurance = insuranceMonthly[i] ?? 0
    const itemized = itemizedMonthly[i] ?? 0
    cumulativePretax += pretax
    cumulativeInsurance += insurance
    cumulativeItemized += itemized
    const cumulativeBasic = MONTHLY_BASIC_DEDUCT * (i + 1)
    const cumulativeTaxable = Math.max(
      0,
      cumulativePretax - cumulativeInsurance - cumulativeBasic - cumulativeItemized,
    )
    const totalTaxDue = calcAnnualIIT(cumulativeTaxable).tax
    const monthlyTax = Math.max(0, totalTaxDue - cumulativeTaxPaid)
    cumulativeTaxPaid += monthlyTax
    rows.push({
      month: i + 1,
      pretax,
      insurance,
      itemized,
      cumulativePretax,
      cumulativeTaxable,
      cumulativeTaxDue: totalTaxDue,
      monthlyTax,
      takeHome: pretax - insurance - monthlyTax,
    })
  }
  return rows
}
