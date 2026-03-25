import React, { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { PageHero } from '@toolbox/ui-kit'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

// 模拟历史汇率数据（相对 CNY 的汇率，1外币=X元人民币）
function generateRates(base: number, days: number, volatility: number): number[] {
  const rates: number[] = [base]
  for (let i = 1; i < days; i++) {
    const change = (Math.random() - 0.48) * volatility
    rates.push(Math.max(base * 0.5, rates[i-1] + change))
  }
  return rates
}

const SEED_RATES: Record<string, Record<string, number>> = {
  USD: { CNY: 7.23, EUR: 0.92, JPY: 149.5, GBP: 0.79, KRW: 1325 },
  EUR: { CNY: 7.85, USD: 1.09, JPY: 162.3, GBP: 0.86, KRW: 1440 },
  JPY: { CNY: 0.048, USD: 0.0067, EUR: 0.0062, GBP: 0.0053, KRW: 8.87 },
  GBP: { CNY: 9.12, USD: 1.27, EUR: 1.17, JPY: 189.2, KRW: 1675 },
  HKD: { CNY: 0.925, USD: 0.128, EUR: 0.117, JPY: 19.1, KRW: 169.8 },
}

const CURRENCIES = ['USD', 'EUR', 'JPY', 'GBP', 'HKD']
const TARGETS = ['CNY', 'USD', 'EUR', 'JPY', 'GBP', 'KRW']

const PERIODS = [
  { key: 'week', days: 7 },
  { key: 'month', days: 30 },
  { key: 'quarter', days: 90 },
  { key: 'year', days: 365 },
]

export default function CurrencyHistory() {
  const { t } = useTranslation('toolCurrencyHistory')
  const [base, setBase] = useState('USD')
  const [target, setTarget] = useState('CNY')
  const [period, setPeriod] = useState('month')

  const days = PERIODS.find(p => p.key === period)?.days || 30

  const { rates, chartData } = useMemo(() => {
    const seedRate = SEED_RATES[base]?.[target] || 1
    const volatility = seedRate * 0.003
    const rates = generateRates(seedRate, days, volatility)
    const now = new Date()
    const chartData = rates.map((rate, i) => {
      const d = new Date(now)
      d.setDate(d.getDate() - (days - 1 - i))
      const label = days <= 30
        ? `${d.getMonth()+1}/${d.getDate()}`
        : days <= 90
          ? `${d.getMonth()+1}月${Math.ceil(d.getDate()/7)}周`
          : `${d.getMonth()+1}月`
      return { label, rate: parseFloat(rate.toFixed(4)) }
    })
    return { rates, chartData }
  }, [base, target, days])

  const current = rates[rates.length - 1]
  const first = rates[0]
  const high = Math.max(...rates)
  const low = Math.min(...rates)
  const change = ((current - first) / first * 100)
  const isUp = change >= 0

  const formatRate = (r: number) => r < 1 ? r.toFixed(4) : r.toFixed(2)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHero title={t('title')} description={t('description')} icon={TrendingUp} />
      <div className="max-w-xl mx-auto px-4 py-6 space-y-4">

        {/* 货币选择 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">{t('base')}</label>
              <select value={base} onChange={e => setBase(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none">
                {CURRENCIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">{t('target')}</label>
              <select value={target} onChange={e => setTarget(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none">
                {TARGETS.filter(c => c !== base).map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            {PERIODS.map(p => (
              <button key={p.key} onClick={() => setPeriod(p.key)}
                className={`flex-1 py-1.5 text-xs rounded-lg font-medium transition-colors ${
                  period === p.key ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'
                }`}>{t(p.key)}</button>
            ))}
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="text-xs text-gray-400 mb-1">{t('current')}</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{formatRate(current)}</div>
            <div className={`flex items-center gap-1 text-sm font-medium mt-1 ${ isUp ? 'text-green-500' : 'text-red-500' }`}>
              {isUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {isUp ? '+' : ''}{change.toFixed(2)}%
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">{t('high')}</span>
              <span className="text-green-500 font-medium">{formatRate(high)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">{t('low')}</span>
              <span className="text-red-500 font-medium">{formatRate(low)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">{t('change')}</span>
              <span className={`font-medium ${ isUp ? 'text-green-500' : 'text-red-500' }`}>{isUp ? '+' : ''}{change.toFixed(2)}%</span>
            </div>
          </div>
        </div>

        {/* 折线图 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            1 {base} = ? {target}
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <XAxis dataKey="label" tick={{ fontSize: 10 }} interval={Math.floor(chartData.length / 5)} />
              <YAxis tick={{ fontSize: 10 }} domain={['auto', 'auto']} tickFormatter={v => formatRate(v)} width={50} />
              <Tooltip formatter={(v: number) => [`${formatRate(v)} ${target}`, `1 ${base}`]} />
              <ReferenceLine y={first} stroke="#94a3b8" strokeDasharray="3 3" />
              <Line type="monotone" dataKey="rate" stroke={isUp ? '#22c55e' : '#ef4444'} dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
          <p className="text-xs text-center text-gray-400 mt-2">⚠️ 数据为模拟演示，仅供参考</p>
        </div>
      </div>
    </div>
  )
}
