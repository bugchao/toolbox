import React, { useState, useMemo } from 'react'

type Method = 'equal' | 'principal'

const MethodLabel: Record<Method, string> = { equal: '等额还款（月供相同）', principal: '等额本金（月供递减）' }

interface MonthRow { month: number; payment: number; principal: number; interest: number; remaining: number }

function calcEqual(principal: number, annualRate: number, months: number): MonthRow[] {
  const r = annualRate / 100 / 12
  if (r === 0) {
    const pay = principal / months
    return Array.from({ length: months }, (_, i) => ({
      month: i + 1, payment: pay, principal: pay, interest: 0,
      remaining: principal - pay * (i + 1)
    }))
  }
  const payment = principal * r * Math.pow(1 + r, months) / (Math.pow(1 + r, months) - 1)
  let remaining = principal
  return Array.from({ length: months }, (_, i) => {
    const interest = remaining * r
    const princ = payment - interest
    remaining -= princ
    return { month: i + 1, payment, principal: princ, interest, remaining: Math.max(0, remaining) }
  })
}

function calcPrincipal(principal: number, annualRate: number, months: number): MonthRow[] {
  const r = annualRate / 100 / 12
  const princ = principal / months
  let remaining = principal
  return Array.from({ length: months }, (_, i) => {
    const interest = remaining * r
    const payment = princ + interest
    remaining -= princ
    return { month: i + 1, payment, principal: princ, interest, remaining: Math.max(0, remaining) }
  })
}

const NumInput = ({ label, value, onChange, suffix }: { label: string; value: number; onChange: (v: number) => void; suffix?: string }) => (
  <div>
    <label className="block text-xs text-gray-500 mb-1">{label}</label>
    <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-700">
      <input type="number" value={value} onChange={e => onChange(parseFloat(e.target.value) || 0)}
        className="flex-1 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 bg-transparent focus:outline-none" />
      {suffix && <span className="px-2 text-xs text-gray-400">{suffix}</span>}
    </div>
  </div>
)

export function InstallmentCalc() {
  const [principal, setPrincipal] = useState(100000)
  const [rate, setRate] = useState(3.65)
  const [months, setMonths] = useState(12)
  const [method, setMethod] = useState<Method>('equal')
  const [showAll, setShowAll] = useState(false)

  const rows = useMemo(() =>
    method === 'equal' ? calcEqual(principal, rate, months) : calcPrincipal(principal, rate, months),
    [principal, rate, months, method]
  )

  const totalPayment = rows.reduce((s, r) => s + r.payment, 0)
  const totalInterest = rows.reduce((s, r) => s + r.interest, 0)
  const firstPayment = rows[0]?.payment || 0
  const lastPayment = rows[rows.length - 1]?.payment || 0

  const displayed = showAll ? rows : rows.slice(0, 6)

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">分期计算器</h1>
      <p className="text-gray-500 dark:text-gray-400">计算贷款分期还款计划，支持等额还款和等额本金两种方式</p>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <NumInput label="贷款金额" value={principal} onChange={setPrincipal} suffix="元" />
          <NumInput label="年利率" value={rate} onChange={setRate} suffix="%" />
          <NumInput label="还款期数" value={months} onChange={setMonths} suffix="月" />
          <div>
            <label className="block text-xs text-gray-500 mb-1">还款方式</label>
            <select value={method} onChange={e => setMethod(e.target.value as Method)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              {(Object.keys(MethodLabel) as Method[]).map(m => <option key={m} value={m}>{MethodLabel[m]}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* 汇总 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: '贷款金额', value: `¥${principal.toLocaleString()}`, color: 'text-gray-900 dark:text-gray-100' },
          { label: method === 'equal' ? '月供' : '首月月供', value: `¥${firstPayment.toFixed(2)}`, color: 'text-indigo-500' },
          { label: '支付总额', value: `¥${totalPayment.toFixed(0)}`, color: 'text-gray-900 dark:text-gray-100' },
          { label: '支付利息', value: `¥${totalInterest.toFixed(0)}`, color: 'text-red-400' },
        ].map(item => (
          <div key={item.label} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 text-center">
            <div className={`text-lg font-bold font-mono ${item.color}`}>{item.value}</div>
            <div className="text-xs text-gray-400 mt-1">{item.label}</div>
          </div>
        ))}
      </div>

      {/* 还款计划表 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                {['期数', '月供', '还本金', '还利息', '剩余本金'].map(h => (
                  <th key={h} className="px-3 py-2 text-left text-xs font-medium text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {displayed.map(row => (
                <tr key={row.month} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="px-3 py-2 text-gray-500">{row.month}</td>
                  <td className="px-3 py-2 font-mono font-medium text-indigo-500">¥{row.payment.toFixed(2)}</td>
                  <td className="px-3 py-2 font-mono text-green-500">¥{row.principal.toFixed(2)}</td>
                  <td className="px-3 py-2 font-mono text-red-400">¥{row.interest.toFixed(2)}</td>
                  <td className="px-3 py-2 font-mono text-gray-600 dark:text-gray-400">¥{row.remaining.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows.length > 6 && (
          <div className="p-3 text-center border-t border-gray-100 dark:border-gray-700">
            <button onClick={() => setShowAll(s => !s)}
              className="text-sm text-indigo-500 hover:underline">
              {showAll ? '收起' : `展开全部 ${rows.length} 期`}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
