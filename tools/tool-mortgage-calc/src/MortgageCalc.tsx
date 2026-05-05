import React, { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Home } from 'lucide-react'
import { PageHero } from '@toolbox/ui-kit'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts'

function formatMoney(n: number) {
  return n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

interface PaymentDetail {
  month: number
  payment: number
  principal: number
  interest: number
  remaining: number
}

export default function MortgageCalc() {
  const { t } = useTranslation('toolMortgageCalc')
  const [amount, setAmount] = useState(1000000)
  const [rate, setRate] = useState(4.9)
  const [years, setYears] = useState(30)
  const [method, setMethod] = useState<'equal' | 'principal'>('equal')
  const [showAll, setShowAll] = useState(false)
  const [prepayAmount, setPrepayAmount] = useState(0)
  const [prepayMonth, setPrepayMonth] = useState(12)

  const result = useMemo(() => {
    const months = years * 12
    const r = rate / 100 / 12
    
    if (method === 'equal') {
      // 等额本息
      const monthly = r === 0 ? amount / months : amount * r * Math.pow(1 + r, months) / (Math.pow(1 + r, months) - 1)
      const total = monthly * months
      const interest = total - amount
      
      const schedule: PaymentDetail[] = []
      let remaining = amount
      
      for (let i = 0; i < months; i++) {
        const interestPart = remaining * r
        const principalPart = monthly - interestPart
        remaining -= principalPart
        
        schedule.push({
          month: i + 1,
          payment: monthly,
          principal: principalPart,
          interest: interestPart,
          remaining: Math.max(0, remaining)
        })
      }
      
      return { monthly, total, interest, schedule }
    } else {
      // 等额本金
      const principalPerMonth = amount / months
      let totalInterest = 0
      const schedule: PaymentDetail[] = []
      let remaining = amount
      
      for (let i = 0; i < months; i++) {
        const interestPart = remaining * r
        const payment = principalPerMonth + interestPart
        totalInterest += interestPart
        remaining -= principalPerMonth
        
        schedule.push({
          month: i + 1,
          payment,
          principal: principalPerMonth,
          interest: interestPart,
          remaining: Math.max(0, remaining)
        })
      }
      
      const firstMonthly = schedule[0].payment
      return { monthly: firstMonthly, total: amount + totalInterest, interest: totalInterest, schedule }
    }
  }, [amount, rate, years, method])

  const prepayResult = useMemo(() => {
    if (prepayAmount <= 0 || prepayMonth <= 0 || prepayMonth > result.schedule.length) {
      return null
    }

    const months = years * 12
    const r = rate / 100 / 12
    const remainingAfterPrepay = result.schedule[prepayMonth - 1].remaining - prepayAmount
    
    if (remainingAfterPrepay <= 0) {
      const interestPaid = result.schedule.slice(0, prepayMonth).reduce((sum, d) => sum + d.interest, 0)
      return {
        savedInterest: result.interest - interestPaid,
        newMonthly: 0,
        remainingMonths: 0
      }
    }

    const remainingMonths = months - prepayMonth
    let newMonthly = 0
    let newTotalInterest = 0

    if (method === 'equal') {
      newMonthly = remainingAfterPrepay * r * Math.pow(1 + r, remainingMonths) / (Math.pow(1 + r, remainingMonths) - 1)
      newTotalInterest = newMonthly * remainingMonths - remainingAfterPrepay
    } else {
      const principalPerMonth = remainingAfterPrepay / remainingMonths
      let remaining = remainingAfterPrepay
      for (let i = 0; i < remainingMonths; i++) {
        const interestPart = remaining * r
        newTotalInterest += interestPart
        remaining -= principalPerMonth
      }
      newMonthly = principalPerMonth + remainingAfterPrepay * r
    }

    const originalRemainingInterest = result.schedule.slice(prepayMonth).reduce((sum, d) => sum + d.interest, 0)
    const savedInterest = originalRemainingInterest - newTotalInterest

    return {
      savedInterest,
      newMonthly,
      remainingMonths
    }
  }, [result, prepayAmount, prepayMonth, amount, rate, years, method])

  const chartData = useMemo(() => {
    const step = Math.max(1, Math.floor(result.schedule.length / 24))
    return result.schedule.filter((_, i) => i % step === 0 || i === result.schedule.length - 1).map(s => ({
      month: `${s.month}期`,
      本金: Math.round(s.principal),
      利息: Math.round(s.interest),
    }))
  }, [result])

  const pieData = [
    { name: '本金', value: amount },
    { name: '利息', value: result.interest }
  ]

  const COLORS = ['#6366f1', '#f97316']

  const displayRows = showAll ? result.schedule : result.schedule.slice(0, 12)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHero title={t('title', '房贷计算器')} description={t('description', '计算房贷月供、总利息和还款计划')} icon={Home} />
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">

        {/* 输入区 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">{t('amount', '贷款总额（元）')}</label>
              <input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} min={10000}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">{t('rate', '年利率（%）')}</label>
              <input type="number" value={rate} onChange={e => setRate(Number(e.target.value))} min={0.1} max={30} step={0.01}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">{t('years', '贷款年限')}</label>
              <select value={years} onChange={e => setYears(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none">
                {[5,10,15,20,25,30].map(y => <option key={y} value={y}>{y}年</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">{t('method', '还款方式')}</label>
              <div className="flex gap-2">
                <button onClick={() => setMethod('equal')}
                  className={`flex-1 py-2 text-sm rounded-lg font-medium transition-colors ${
                    method === 'equal' ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}>{t('equalPayment', '等额本息')}</button>
                <button onClick={() => setMethod('principal')}
                  className={`flex-1 py-2 text-sm rounded-lg font-medium transition-colors ${
                    method === 'principal' ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}>{t('equalPrincipal', '等额本金')}</button>
              </div>
            </div>
          </div>
        </div>

        {/* 结果 */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4 border border-indigo-100 dark:border-indigo-800">
            <div className="text-xs text-indigo-400 mb-1">{method === 'equal' ? t('monthlyPayment', '月供') : t('firstMonthPayment', '首月月供')}</div>
            <div className="text-xl font-bold text-indigo-600">¥{formatMoney(result.monthly)}</div>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4 border border-orange-100 dark:border-orange-800">
            <div className="text-xs text-orange-400 mb-1">{t('totalInterest', '总利息')}</div>
            <div className="text-xl font-bold text-orange-500">¥{formatMoney(result.interest)}</div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-100 dark:border-green-800">
            <div className="text-xs text-green-400 mb-1">{t('totalPayment', '还款总额')}</div>
            <div className="text-xl font-bold text-green-600">¥{formatMoney(result.total)}</div>
          </div>
        </div>

        {/* 图表区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* 还款趋势图 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">{t('paymentTrend', '还款趋势')}</h3>
            <ResponsiveContainer width="100%" height={200}>
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

          {/* 本息占比饼图 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">{t('principalInterestRatio', '本息占比')}</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                  outerRadius={70}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => `¥${formatMoney(v)}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 提前还款计算 */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800 p-5">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">💰 {t('prepayment', '提前还款计算')}</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">{t('prepayAmount', '提前还款金额（元）')}</label>
              <input type="number" value={prepayAmount} onChange={e => setPrepayAmount(Number(e.target.value))} min={0}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-yellow-500" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">{t('prepayMonth', '第几个月还款')}</label>
              <input type="number" value={prepayMonth} onChange={e => setPrepayMonth(Number(e.target.value))} min={1} max={result.schedule.length}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-yellow-500" />
            </div>
          </div>

          {prepayResult && (
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white dark:bg-gray-700 rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-1">{t('savedInterest', '节省利息')}</div>
                <div className="text-lg font-bold text-green-600">¥{formatMoney(prepayResult.savedInterest)}</div>
              </div>
              <div className="bg-white dark:bg-gray-700 rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-1">{t('newMonthly', '新月供')}</div>
                <div className="text-lg font-bold text-blue-600">¥{formatMoney(prepayResult.newMonthly)}</div>
              </div>
              <div className="bg-white dark:bg-gray-700 rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-1">{t('remainingMonths', '剩余月数')}</div>
                <div className="text-lg font-bold text-gray-800 dark:text-gray-200">{prepayResult.remainingMonths}</div>
              </div>
            </div>
          )}
        </div>

        {/* 还款计划表 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t('schedule', '还款计划表')}</h3>
            <button
              onClick={() => setShowAll(!showAll)}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
            >
              {showAll ? t('showLess', '收起') : t('showAll', '显示全部')}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-2 text-xs text-gray-500 text-left">{t('month', '期数')}</th>
                  <th className="px-4 py-2 text-xs text-gray-500 text-right">{t('payment', '月供')}</th>
                  <th className="px-4 py-2 text-xs text-gray-500 text-right">{t('principal', '本金')}</th>
                  <th className="px-4 py-2 text-xs text-gray-500 text-right">{t('interest', '利息')}</th>
                  <th className="px-4 py-2 text-xs text-gray-500 text-right">{t('remaining', '剩余本金')}</th>
                </tr>
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
        </div>

        {/* 说明 */}
        <div className="text-center text-xs text-gray-500 space-y-1">
          <p>💡 {t('equalPaymentDesc', '等额本息：每月还款金额固定')}</p>
          <p>💡 {t('equalPrincipalDesc', '等额本金：每月还款本金固定，利息递减')}</p>
        </div>
      </div>
    </div>
  )
}
