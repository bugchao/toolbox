import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { PageHero } from '@toolbox/ui-kit'
import { useToolStorage } from '@toolbox/storage'
import { Calculator, DollarSign } from 'lucide-react'

const TAX_BRACKETS = [
  { min: 0, max: 36000, rate: 0.03, quickDeduction: 0 },
  { min: 36000, max: 144000, rate: 0.1, quickDeduction: 2520 },
  { min: 144000, max: 300000, rate: 0.2, quickDeduction: 16920 },
  { min: 300000, max: 420000, rate: 0.25, quickDeduction: 31920 },
  { min: 420000, max: 660000, rate: 0.3, quickDeduction: 52920 },
  { min: 660000, max: 960000, rate: 0.35, quickDeduction: 85920 },
  { min: 960000, max: Infinity, rate: 0.45, quickDeduction: 181920 },
]

const SOCIAL_RATE = {
  pension: 0.08,
  medical: 0.02,
  unemployment: 0.005,
  housing: 0.12,
}

interface SalaryState {
  grossSalary: number
  socialBase: number
  threshold: number
}

const DEFAULT_STATE: SalaryState = {
  grossSalary: 10000,
  socialBase: 10000,
  threshold: 5000,
}

export default function SalaryCalc() {
  const { t } = useTranslation('toolSalaryCalc')
  const { data: state, save } = useToolStorage<SalaryState>('salary-calc', 'data', DEFAULT_STATE)

  const { grossSalary, socialBase, threshold } = state

  const result = useMemo(() => {
    const socialInsurance = socialBase * (SOCIAL_RATE.pension + SOCIAL_RATE.medical + SOCIAL_RATE.unemployment + SOCIAL_RATE.housing)
    const taxableIncome = Math.max(0, grossSalary - socialInsurance - threshold)
    let tax = 0
    for (const b of TAX_BRACKETS) {
      if (taxableIncome > b.min) {
        tax += (Math.min(taxableIncome, b.max) - b.min) * b.rate
      }
    }
    const netSalary = grossSalary - socialInsurance - tax
    return {
      socialInsurance,
      taxableIncome,
      tax,
      netSalary,
      pension: socialBase * SOCIAL_RATE.pension,
      medical: socialBase * SOCIAL_RATE.medical,
      unemployment: socialBase * SOCIAL_RATE.unemployment,
      housing: socialBase * SOCIAL_RATE.housing,
    }
  }, [grossSalary, socialBase, threshold])

  const set = (key: keyof SalaryState, val: number) =>
    save({ ...state, [key]: val })

  const fmt = (n: number) => `¥${n.toFixed(2)}`

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHero
        title={t('title')}
        description={t('description')}
        icon={Calculator}
      />
      <div className="max-w-xl mx-auto px-4 py-6 space-y-4">
        {/* 月薪 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t('inputParams')}</h3>
          {([
            { label: t('grossSalary'), key: 'grossSalary' as const, min: 0, max: 100000 },
            { label: t('socialBase'), key: 'socialBase' as const, min: 0, max: 100000 },
            { label: t('threshold'), key: 'threshold' as const, min: 3500, max: 5000 },
          ] as const).map(({ label, key, min, max }) => (
            <div key={key}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-400">{label}</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">¥{state[key].toLocaleString()}</span>
              </div>
              <input type="range" min={min} max={max} step={100} value={state[key]}
                onChange={e => set(key, Number(e.target.value))}
                className="w-full accent-blue-500" />
              <input type="number" value={state[key]} onChange={e => set(key, Number(e.target.value))}
                className="mt-1 w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
            </div>
          ))}
        </div>

        {/* 结果 */}
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-6 text-white">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-5 h-5" />
            <span className="text-sm opacity-80">{t('netSalary')}</span>
          </div>
          <div className="text-4xl font-bold">{fmt(result.netSalary)}</div>
          <div className="mt-3 text-sm opacity-80">{t('takeHomeRatio')}: {((result.netSalary / grossSalary) * 100).toFixed(1)}%</div>
        </div>

        {/* 明细 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-2">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">{t('breakdown')}</h3>
          {([
            ['养老保险 (8%)', result.pension],
            ['医疗保险 (2%)', result.medical],
            ['失业保险 (0.5%)', result.unemployment],
            ['住房公积金 (12%)', result.housing],
          ] as const).map(([label, val]) => (
            <div key={label as string} className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">{label}</span>
              <span className="text-gray-900 dark:text-gray-100">{fmt(val as number)}</span>
            </div>
          ))}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-2 flex justify-between font-medium">
            <span className="text-gray-700 dark:text-gray-300">社保合计</span>
            <span>{fmt(result.socialInsurance)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">应纳税所得额</span>
            <span>{fmt(result.taxableIncome)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">{t('personalTax')}</span>
            <span className="text-red-500">{fmt(result.tax)}</span>
          </div>
        </div>

        {/* 到手比例 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">{t('takeHomeRatio')}</span>
            <span className="text-lg font-bold text-green-500">{((result.netSalary / grossSalary) * 100).toFixed(1)}%</span>
          </div>
          <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 transition-all" style={{ width: `${(result.netSalary / grossSalary) * 100}%` }} />
          </div>
        </div>
      </div>
    </div>
  )
}
