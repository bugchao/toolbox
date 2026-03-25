import React, { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Calculator } from 'lucide-react'
import { PageHero } from '@toolbox/ui-kit'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'

function formatMoney(n: number) {
  return n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function LoanCalc() {
  const { t } = useTranslation('toolLoanCalc')
  const [amount, setAmount] = useState(500000)
  const [rate, setRate] = useState(3.7)
  const [months, setMonths] = useState(360)
  const [method, setMethod] = useState<'equal' | 'principal'>('equal')
  const [showAll, setShowAll] = useState(false)

  const result = useMemo(() => {
    const r = rate / 100 / 12
    if (method === 'equal') {
      // 等额本息
      const monthly = r === 0 ? amount / months : amount * r * Math.pow(1 + r, months) / (Math.pow(1 + r, months) - 1)
      const total = monthly * months
      const interest = total - amount
      const schedule = Array.from({ length: months }, (_, i) => {
        const remaining = amount * (Math.pow(1 + r, months) - Math.pow(1 + r, i + 1)) / (Math.pow(1 + r, months) - 1)
        const interestPart = (amount - (monthly * i - amount * (Math.pow(1 + r, i) - 1) / (Math.pow(1 + r, months) - 1) * Math.pow(1 + r, months))) * r
        return { month: i + 1, payment: monthly, principal: monthly - interestPart, interest: interestPart, remaining: Math.max(0, remaining) }
      })
      return { monthly, total, interest, schedule }
    } else {
      // 等额本金
      const principalPerMonth = amount / months
      let totalInterest = 0
      const schedule = Array.from({ length: months }, (_, i) => {
        const remaining = amount - principalPerMonth * i
        const interestPart = remaining * r
        const payment = principalPerMonth + interestPart
        totalInterest += interestPart
        return { month: i + 1, payment, principal: principalPerMonth, interest: interestPart, remaining: Math.max(0, remaining - principalPerMonth) }
      })
      const firstMonthly = schedule[0].payment
      return { monthly: firstMonthly, total: amount + totalInterest, interest: totalInterest, schedule }
    }
  }, [amount, rate, months, method])

  const chartData = useMemo(() => {
    const step = Math.max(1, Math.floor(months / 24))
    return result.schedule.filter((_, i) => i % step === 0 || i === months - 1).map(s => ({
      month: `${s.month}期`,
      本金: Math.round(s.principal),
      利息: Math.round(s.interest),
    }))
  }, [result, months])

  const displayRows = showAll ? result.schedule : result.schedule.slice(0, 12)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHero title={t('title')} description={t('description')} icon={Calculator} />
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">

        {/* 输入区 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">{t('amount')}</label>
              <input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} min={1000}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">{t('rate')}</label>
              <input type="number" value={rate} onChange={e => setRate(Number(e.target.value))} min={0.1} max={30} step={0.1}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">{t('months')}</label>
              <select value={months} onChange={e => setMonths(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none">
                {[12,24,36,60,120,180,240,300,360].map(m => <option key={m} value={m}>{m}个月（{m/12}年）</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">{t('method')}</label>
              <div className="flex gap-2">
                <button onClick={() => setMethod('equal')}
                  className={`flex-1 py-2 text-sm rounded-lg font-medium transition-colors ${
                    method === 'equal' ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}>{t('equalInstallment')}</button>
                <button onClick={() => setMethod('principal')}
                  className={`flex-1 py-2 text-sm rounded-lg font-medium transition-colors ${
                    method === 'principal' ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}>{t('equalPrincipal')}</button>
              </div>
            </div>
          </div>
        </div>

        {/* 结果 */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4 border border-indigo-100 dark:border-indigo-800">
            <div className="text-xs text-indigo-400 mb-1">{method === 'equal' ? t('monthlyPayment') : '首月月供'}</div>
            <div className="text-xl font-bold text-indigo-600">¥{formatMoney(result.monthly)}</div>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4 border border-orange-100 dark:border-orange-800">
            <div className="text-xs text-orange-400 mb-1">{t('totalInterest')}</div>
            <div className="text-xl font-bold text-orange-500">¥{formatMoney(result.interest)}</div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-100 dark:border-green-800">
            <div className="text-xs text-green-400 mb-1">{t('totalPayment')}</div>
            <div className="text-xl font-bold text-green-600">¥{formatMoney(result.total)}</div>
          </div>
        </div>

        {/* 图表 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">还款构成趋势</h3>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={chartData}>
              <XAxis dataKey="month" tick={{ fontSize: 10 }} interval={Math.floor(chartData.length / 5)} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => `¥${formatMoney(v)}`} />
              <Legend />
              <Area type="monotone" dataKey="本金" stackId="1" stroke="#6366f1" fill="#e0e7ff" />
              <Area type="monotone" dataKey="利息" stackId="1" stroke="#f97316" fill="#ffedd5" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* 还款计划表 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t('schedule')}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>{[t('month'), t('payment'), t('principal'), t('interest'), t('remaining')].map(h => (
                  <th key={h} className="px-4 py-2 text-xs text-gray-500 text-right first:text-left">{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {displayRows.map(row => (
                  <tr key={row.month} className="border-t border-gray-50 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-4 py-2 text-gray-600 dark:text-gray-400">{row.month}</td>
                    <td className="px-4 py-2 text-right text-indigo-600">¥{formatMoney(row.payment)}</td>
                    <td className="px-4 py-2 text-right text-green-600">¥{formatMoney(row.principal)}</td>
                    <td className="px-4 py-2 text-right text-orange-500">¥{formatMoney(row.interest)}</td>
                    <td className="px-4 py-2 text-right text-gray-500">¥{formatMoney(row.remaining)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {months > 12 && (
            <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700 text-center">
              <button onClick={() => setShowAll(v => !v)} className="text-sm text-indigo-500 hover:text-indigo-700">
                {showAll ? '收起' : `显示全部 ${months} 期`}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
