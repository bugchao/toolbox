import React, { useState, useEffect, useCallback } from 'react'
import { ArrowLeftRight, RefreshCw } from 'lucide-react'

const CURRENCIES = [
  { code: 'CNY', name: '人民币', symbol: '¥', flag: '🇨🇳' },
  { code: 'USD', name: '美元', symbol: '$', flag: '🇺🇸' },
  { code: 'EUR', name: '欧元', symbol: '€', flag: '🇪🇺' },
  { code: 'GBP', name: '英镑', symbol: '£', flag: '🇬🇧' },
  { code: 'JPY', name: '日元', symbol: '¥', flag: '🇯🇵' },
  { code: 'KRW', name: '韩元', symbol: '₩', flag: '🇰🇷' },
  { code: 'HKD', name: '港币', symbol: 'HK$', flag: '🇭🇰' },
  { code: 'SGD', name: '新加坡元', symbol: 'S$', flag: '🇸🇬' },
  { code: 'AUD', name: '澳元', symbol: 'A$', flag: '🇦🇺' },
  { code: 'CAD', name: '加元', symbol: 'C$', flag: '🇨🇦' },
  { code: 'CHF', name: '瑞士法郎', symbol: 'Fr', flag: '🇨🇭' },
  { code: 'THB', name: '泰铢', symbol: '฿', flag: '🇹🇭' },
]

// 固定汇率（相对USD），使用近似值（不调用外部API）
const RATES_VS_USD: Record<string, number> = {
  USD: 1, CNY: 7.24, EUR: 0.92, GBP: 0.79, JPY: 149.5,
  KRW: 1325, HKD: 7.82, SGD: 1.34, AUD: 1.53, CAD: 1.36, CHF: 0.90, THB: 35.1,
}

function convert(amount: number, from: string, to: string): number {
  const usd = amount / RATES_VS_USD[from]
  return usd * RATES_VS_USD[to]
}

const CurrencySelect = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
  <select value={value} onChange={e => onChange(e.target.value)}
    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
    {CURRENCIES.map(c => (
      <option key={c.code} value={c.code}>{c.flag} {c.code} - {c.name}</option>
    ))}
  </select>
)

export function CurrencyConverter() {
  const [amount, setAmount] = useState(100)
  const [from, setFrom] = useState('USD')
  const [to, setTo] = useState('CNY')
  const [lastUpdated] = useState(() => new Date().toLocaleDateString('zh-CN'))

  const result = convert(amount, from, to)
  const rate = convert(1, from, to)

  const swap = useCallback(() => { setFrom(to); setTo(from) }, [from, to])

  const fromCur = CURRENCIES.find(c => c.code === from)!
  const toCur = CURRENCIES.find(c => c.code === to)!

  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">汇率换算</h1>
        <span className="text-xs text-gray-400 flex items-center gap-1">
          <RefreshCw className="w-3 h-3" />参考汇率 {lastUpdated}
        </span>
      </div>

      <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-xl p-3 text-xs text-yellow-700 dark:text-yellow-400">
        汇率为内置参考值，实际汇率请以银行/交易所为准
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
        {/* 金额输入 */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">金额</label>
          <input type="number" value={amount} onChange={e => setAmount(parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-3 text-2xl font-bold rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>

        {/* 货币选择 */}
        <div className="flex gap-2 items-center">
          <div className="flex-1 space-y-1">
            <label className="block text-xs text-gray-500">从</label>
            <CurrencySelect value={from} onChange={setFrom} />
          </div>
          <button onClick={swap}
            className="mt-5 p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-gray-200 transition-colors">
            <ArrowLeftRight className="w-4 h-4" />
          </button>
          <div className="flex-1 space-y-1">
            <label className="block text-xs text-gray-500">到</label>
            <CurrencySelect value={to} onChange={setTo} />
          </div>
        </div>
      </div>

      {/* 结果 */}
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-5 text-white">
        <div className="text-sm opacity-80 mb-1">{amount.toLocaleString()} {fromCur.flag} {from} =</div>
        <div className="text-4xl font-bold">{toCur.symbol}{result.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        <div className="text-sm opacity-70 mt-1">{toCur.flag} {to} · {toCur.name}</div>
      </div>

      {/* 汇率参考 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="text-xs text-gray-500 mb-3">1 {from} 对其他货币</div>
        <div className="grid grid-cols-2 gap-2">
          {CURRENCIES.filter(c => c.code !== from).map(c => (
            <div key={c.code} className="flex justify-between text-sm">
              <span className="text-gray-500">{c.flag} {c.code}</span>
              <span className="font-mono font-medium text-gray-900 dark:text-gray-100">
                {convert(1, from, c.code).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
