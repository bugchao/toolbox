import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { PageHero } from '@toolbox/ui-kit'
import { useToolStorage } from '@toolbox/storage'
import { ArrowLeftRight, TrendingUp } from 'lucide-react'

const CURRENCIES = [
  { code: 'CNY', name: '人民币', symbol: '¥' },
  { code: 'USD', name: '美元', symbol: '$' },
  { code: 'EUR', name: '欧元', symbol: '€' },
  { code: 'JPY', name: '日元', symbol: '¥' },
  { code: 'GBP', name: '英镑', symbol: '£' },
  { code: 'AUD', name: '澳元', symbol: 'A$' },
  { code: 'CAD', name: '加元', symbol: 'C$' },
  { code: 'CHF', name: '瑞郎', symbol: 'Fr' },
  { code: 'HKD', name: '港币', symbol: 'HK$' },
  { code: 'KRW', name: '韩元', symbol: '₩' },
  { code: 'THB', name: '泰铢', symbol: '฿' },
  { code: 'SGD', name: '新元', symbol: 'S$' },
]

const BASE_RATES: Record<string, number> = {
  CNY: 1, USD: 0.138, EUR: 0.129, JPY: 20.5, GBP: 0.109,
  AUD: 0.215, CAD: 0.193, CHF: 0.123, HKD: 1.076,
  KRW: 189.5, THB: 4.72, SGD: 0.185,
}

interface ConverterState {
  amount: number
  fromCurrency: string
  toCurrency: string
}

const DEFAULT_STATE: ConverterState = {
  amount: 100,
  fromCurrency: 'CNY',
  toCurrency: 'USD',
}

export default function CurrencyConverter() {
  const { t } = useTranslation('toolCurrencyConverter')
  const [state, setState] = useToolStorage<ConverterState>('currency-converter', DEFAULT_STATE)

  const { amount, fromCurrency, toCurrency } = state

  const set = (patch: Partial<ConverterState>) =>
    setState(prev => ({ ...prev, ...patch }))

  const result = useMemo(() => {
    const fromRate = BASE_RATES[fromCurrency]
    const toRate = BASE_RATES[toCurrency]
    return {
      converted: (amount * toRate) / fromRate,
      rate: toRate / fromRate,
      inverseRate: fromRate / toRate,
    }
  }, [amount, fromCurrency, toCurrency])

  const swap = () => set({ fromCurrency: toCurrency, toCurrency: fromCurrency })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHero
        title={t('title')}
        description={t('description')}
        icon={<ArrowLeftRight className="w-8 h-8" />}
      />
      <div className="max-w-xl mx-auto px-4 py-6 space-y-4">
        {/* 金额 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('amount')}</label>
          <input type="number" value={amount} onChange={e => set({ amount: Number(e.target.value) })}
            className="w-full px-3 py-3 text-2xl font-bold rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>

        {/* 货币选择 */}
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('from')}</label>
            <select value={fromCurrency} onChange={e => set({ fromCurrency: e.target.value })}
              className="w-full px-3 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code} - {c.name}</option>)}
            </select>
          </div>
          <button onClick={swap} className="mt-6 p-3 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 hover:bg-indigo-200 transition-colors">
            <ArrowLeftRight className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('to')}</label>
            <select value={toCurrency} onChange={e => set({ toCurrency: e.target.value })}
              className="w-full px-3 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code} - {c.name}</option>)}
            </select>
          </div>
        </div>

        {/* 结果 */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="text-sm opacity-80 mb-1">{amount.toLocaleString()} {fromCurrency} =</div>
          <div className="text-4xl font-bold">
            {result.converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {toCurrency}
          </div>
          <div className="text-sm opacity-80 mt-2">1 {fromCurrency} = {result.rate.toFixed(4)} {toCurrency}</div>
        </div>

        {/* 汇率信息 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t('rateInfo')}</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">1 {fromCurrency}</span>
              <span className="text-gray-900 dark:text-gray-100">= {result.rate.toFixed(6)} {toCurrency}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">1 {toCurrency}</span>
              <span className="text-gray-900 dark:text-gray-100">= {result.inverseRate.toFixed(6)} {fromCurrency}</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-400">⚠️ {t('disclaimer')}</div>
        </div>

        {/* 快速换算 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">{t('quickConvert')}</h3>
          <div className="grid grid-cols-3 gap-2">
            {[100, 500, 1000, 5000, 10000, 50000].map(val => (
              <button key={val} onClick={() => set({ amount: val })}
                className="px-3 py-2 text-sm rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                {val.toLocaleString()}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
