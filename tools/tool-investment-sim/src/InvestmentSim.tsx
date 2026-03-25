import React, { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { TrendingUp } from 'lucide-react'
import { PageHero } from '@toolbox/ui-kit'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

export default function InvestmentSim() {
  const { t } = useTranslation('toolInvestmentSim')
  const [initial, setInitial] = useState(10000)
  const [monthly, setMonthly] = useState(1000)
  const [rate, setRate] = useState(7)
  const [years, setYears] = useState(10)

  const { chartData, finalAmount, totalInvested, totalReturn } = useMemo(() => {
    const monthlyRate = rate / 100 / 12
    const chartData = []
    let balance = initial
    let invested = initial
    for (let y = 0; y <= years; y++) {
      if (y > 0) {
        for (let m = 0; m < 12; m++) {
          balance = balance * (1 + monthlyRate) + monthly
          invested += monthly
        }
      }
      chartData.push({
        year: `第${y}年`,
        invested: Math.round(invested),
        balance: Math.round(balance),
      })
    }
    return {
      chartData,
      finalAmount: Math.round(balance),
      totalInvested: Math.round(invested),
      totalReturn: Math.round(balance - invested),
    }
  }, [initial, monthly, rate, years])

  const fmt = (n: number) => n >= 10000 ? `${(n / 10000).toFixed(2)}万` : n.toLocaleString()

  const SLIDERS = [
    { label: t('initialAmount'), value: initial, set: setInitial, min: 0, max: 500000, step: 1000 },
    { label: t('monthlyAmount'), value: monthly, set: setMonthly, min: 0, max: 50000, step: 500 },
    { label: t('annualRate'), value: rate, set: setRate, min: 1, max: 30, step: 0.5 },
    { label: t('years'), value: years, set: setYears, min: 1, max: 40, step: 1 },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHero title={t('title')} description={t('description')} icon={TrendingUp} />
      <div className="max-w-xl mx-auto px-4 py-6 space-y-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-4">
          {SLIDERS.map(({ label, value, set, min, max, step }) => (
            <div key={label}>
              <div className="flex justify-between mb-1">
                <label className="text-xs text-gray-500">{label}</label>
                <span className="text-xs font-semibold text-indigo-600">
                  {label.includes('率') ? `${value}%` : label.includes('年限') ? `${value}年` : fmt(value)}
                </span>
              </div>
              <input type="range" min={min} max={max} step={step} value={value}
                onChange={e => set(parseFloat(e.target.value))}
                className="w-full h-1.5 accent-indigo-600" />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 text-center">
            <div className="text-xs text-gray-400 mb-1">{t('totalInvested')}</div>
            <div className="text-lg font-bold text-gray-700 dark:text-gray-300">{fmt(totalInvested)}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-green-200 dark:border-green-800 p-3 text-center">
            <div className="text-xs text-gray-400 mb-1">{t('totalReturn')}</div>
            <div className="text-lg font-bold text-green-500">{fmt(totalReturn)}</div>
          </div>
          <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800 p-3 text-center">
            <div className="text-xs text-gray-400 mb-1">{t('finalAmount')}</div>
            <div className="text-lg font-bold text-indigo-600">{fmt(finalAmount)}</div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">{t('growthChart')}</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="year" tick={{ fontSize: 10 }} interval={Math.floor(years / 5)} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${(v/10000).toFixed(0)}万`} width={45} />
              <Tooltip formatter={(v: number, n: string) => [fmt(v), n === 'balance' ? '资产总值' : '累计投入']} />
              <Area type="monotone" dataKey="invested" stackId="1" stroke="#94a3b8" fill="#e2e8f0" />
              <Area type="monotone" dataKey="balance" stackId="2" stroke="#6366f1" fill="#eef2ff" />
            </AreaChart>
          </ResponsiveContainer>
          <p className="text-xs text-center text-gray-400 mt-2">{t('disclaimer')}</p>
        </div>
      </div>
    </div>
  )
}
