import React, { useState, useMemo } from 'react'

// 2024年个税税率表
const TAX_BRACKETS = [
  { min: 0, max: 3000, rate: 0.03, deduction: 0 },
  { min: 3000, max: 12000, rate: 0.1, deduction: 210 },
  { min: 12000, max: 25000, rate: 0.2, deduction: 1410 },
  { min: 25000, max: 35000, rate: 0.25, deduction: 2660 },
  { min: 35000, max: 55000, rate: 0.30, deduction: 4410 },
  { min: 55000, max: 80000, rate: 0.35, deduction: 7160 },
  { min: 80000, max: Infinity, rate: 0.45, deduction: 15160 },
]

// 各城市社保缴纳比例（个人部分）
const CITIES: Record<string, { pension: number; medical: number; unemployment: number; housing: number; medicalExtra: number }> = {
  '北京': { pension: 0.08, medical: 0.02, unemployment: 0.005, housing: 0.12, medicalExtra: 3 },
  '上海': { pension: 0.08, medical: 0.02, unemployment: 0.005, housing: 0.07, medicalExtra: 0 },
  '广州': { pension: 0.08, medical: 0.02, unemployment: 0.002, housing: 0.05, medicalExtra: 0 },
  '深圳': { pension: 0.08, medical: 0.02, unemployment: 0.003, housing: 0.05, medicalExtra: 0 },
  '杭州': { pension: 0.08, medical: 0.02, unemployment: 0.005, housing: 0.12, medicalExtra: 3 },
  '其他': { pension: 0.08, medical: 0.02, unemployment: 0.005, housing: 0.07, medicalExtra: 0 },
}

const EXEMPT = 5000 // 起征点

function calcTax(taxable: number): number {
  if (taxable <= 0) return 0
  const bracket = TAX_BRACKETS.find(b => taxable > b.min && taxable <= b.max) ||
    TAX_BRACKETS[TAX_BRACKETS.length - 1]
  return taxable * bracket.rate - bracket.deduction
}

const NumberInput = ({ label, value, onChange, prefix, suffix }: {
  label: string; value: number; onChange: (v: number) => void; prefix?: string; suffix?: string
}) => (
  <div>
    <label className="block text-xs text-gray-500 mb-1">{label}</label>
    <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-700">
      {prefix && <span className="px-2 text-sm text-gray-400 bg-gray-50 dark:bg-gray-600 border-r border-gray-300 dark:border-gray-600">{prefix}</span>}
      <input type="number" value={value} onChange={e => onChange(parseFloat(e.target.value) || 0)}
        className="flex-1 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 bg-transparent focus:outline-none" />
      {suffix && <span className="px-2 text-sm text-gray-400">{suffix}</span>}
    </div>
  </div>
)

export function SalaryCalc() {
  const [gross, setGross] = useState(15000)
  const [city, setCity] = useState('北京')
  const [extraDeduct, setExtraDeduct] = useState(0) // 专项附加扣除

  const result = useMemo(() => {
    const rates = CITIES[city]
    const pension = gross * rates.pension
    const medical = gross * rates.medical + rates.medicalExtra
    const unemployment = gross * rates.unemployment
    const housing = gross * rates.housing
    const socialTotal = pension + medical + unemployment + housing

    const taxBase = Math.max(0, gross - socialTotal - EXEMPT - extraDeduct)
    const tax = calcTax(taxBase)
    const net = gross - socialTotal - tax
    const effectiveRate = gross > 0 ? ((tax + socialTotal) / gross * 100) : 0

    return { pension, medical, unemployment, housing, socialTotal, taxBase, tax, net, effectiveRate }
  }, [gross, city, extraDeduct])

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">工资税后计算器</h1>
      <p className="text-gray-500 dark:text-gray-400">计算五险一金扣除及个人所得税，得出税后实发工资</p>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
        <NumberInput label="税前月薪" value={gross} onChange={setGross} prefix="¥" />
        <div>
          <label className="block text-xs text-gray-500 mb-1">城市（影响公积金比例）</label>
          <select value={city} onChange={e => setCity(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
            {Object.keys(CITIES).map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <NumberInput label="专项附加扣除（子女教育/房贷等）" value={extraDeduct} onChange={setExtraDeduct} prefix="¥" />
      </div>

      {/* 结果卡片 */}
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-5 text-white">
        <div className="text-sm opacity-80 mb-1">税后实发</div>
        <div className="text-4xl font-bold">¥{result.net.toFixed(2)}</div>
        <div className="text-sm opacity-70 mt-1">综合税率 {result.effectiveRate.toFixed(1)}%</div>
      </div>

      {/* 明细 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-3">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">扣费明细</h2>
        {[
          { label: '税前工资', value: gross, type: 'neutral' },
          { label: '养老保险 (8%)', value: -result.pension, type: 'deduct' },
          { label: '医疗保险 (2%+附加)', value: -result.medical, type: 'deduct' },
          { label: '失业保险', value: -result.unemployment, type: 'deduct' },
          { label: `住房公积金 (${(CITIES[city].housing * 100).toFixed(0)}%)`, value: -result.housing, type: 'deduct' },
          { label: '个税计税基数', value: result.taxBase, type: 'neutral' },
          { label: '个人所得税', value: -result.tax, type: 'deduct' },
          { label: '实发工资', value: result.net, type: 'income' },
        ].map(item => (
          <div key={item.label} className="flex justify-between items-center text-sm">
            <span className="text-gray-600 dark:text-gray-400">{item.label}</span>
            <span className={`font-medium font-mono ${
              item.type === 'income' ? 'text-green-500' :
              item.type === 'deduct' ? 'text-red-400' : 'text-gray-900 dark:text-gray-100'
            }`}>{item.value < 0 ? '-' : ''}¥{Math.abs(item.value).toFixed(2)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
