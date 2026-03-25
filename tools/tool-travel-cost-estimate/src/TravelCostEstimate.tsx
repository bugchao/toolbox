import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PlaneTakeoff } from 'lucide-react'
import { PageHero } from '@toolbox/ui-kit'

interface Dest {
  name: string
  currency: string
  rate: number
  accommodation: number
  food: number
  transport: number
  activities: number
}

const DESTINATIONS: Dest[] = [
  { name: '日本东京', currency: 'JPY', rate: 0.048, accommodation: 6000, food: 3000, transport: 2000, activities: 2000 },
  { name: '泰国曼谷', currency: 'THB', rate: 0.2, accommodation: 300, food: 150, transport: 100, activities: 200 },
  { name: '韩国首尔', currency: 'KRW', rate: 0.0053, accommodation: 80000, food: 40000, transport: 20000, activities: 30000 },
  { name: '法国巴黎', currency: 'EUR', rate: 7.8, accommodation: 120, food: 60, transport: 20, activities: 40 },
  { name: '美国纽约', currency: 'USD', rate: 7.2, accommodation: 180, food: 80, transport: 15, activities: 50 },
  { name: '新加坡', currency: 'SGD', rate: 5.3, accommodation: 120, food: 40, transport: 20, activities: 30 },
  { name: '英国伦敦', currency: 'GBP', rate: 9.1, accommodation: 120, food: 50, transport: 15, activities: 35 },
  { name: '澳大利亚悉尼', currency: 'AUD', rate: 4.6, accommodation: 150, food: 60, transport: 15, activities: 40 },
]

export default function TravelCostEstimate() {
  const { t } = useTranslation('toolTravelCostEstimate')
  const [destIdx, setDestIdx] = useState(0)
  const [days, setDays] = useState(7)
  const [custom, setCustom] = useState({ accommodation: 0, food: 0, transport: 0, activities: 0, shopping: 0 })
  const [useCustom, setUseCustom] = useState(false)

  const dest = DESTINATIONS[destIdx]
  const rate = dest.rate

  const costs = useCustom ? custom : {
    accommodation: dest.accommodation,
    food: dest.food,
    transport: dest.transport,
    activities: dest.activities,
    shopping: 0,
  }

  const toCny = (localAmount: number) => Math.round(localAmount * rate)

  const dailyCny = [
    { label: t('accommodation'), local: costs.accommodation, cny: toCny(costs.accommodation) },
    { label: t('food'), local: costs.food, cny: toCny(costs.food) },
    { label: t('transport'), local: costs.transport, cny: toCny(costs.transport) },
    { label: t('activities'), local: costs.activities, cny: toCny(costs.activities) },
    { label: t('shopping'), local: costs.shopping, cny: toCny(costs.shopping) },
  ]

  const dailyTotal = dailyCny.reduce((s, c) => s + c.cny, 0)
  const tripTotal = dailyTotal * days

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHero title={t('title')} description={t('description')} icon={PlaneTakeoff} />
      <div className="max-w-md mx-auto px-4 py-6 space-y-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">{t('destination')}</label>
            <select value={destIdx} onChange={e => { setDestIdx(parseInt(e.target.value)); setUseCustom(false) }}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none">
              {DESTINATIONS.map((d, i) => <option key={i} value={i}>{d.name} ({d.currency})</option>)}
            </select>
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <label className="text-xs text-gray-500">{t('days')}</label>
              <span className="text-xs font-semibold text-indigo-600">{days} 天</span>
            </div>
            <input type="range" min={1} max={30} value={days} onChange={e => setDays(parseInt(e.target.value))}
              className="w-full h-1.5 accent-indigo-600" />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="useCustom" checked={useCustom} onChange={e => setUseCustom(e.target.checked)}
              className="accent-indigo-600" />
            <label htmlFor="useCustom" className="text-xs text-gray-500">自定义每日消费（{dest.currency}）</label>
          </div>
          {useCustom && (
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(custom).map(([key, val]) => (
                <div key={key}>
                  <label className="text-xs text-gray-400 mb-0.5 block">{t(key)}</label>
                  <input type="number" min={0} value={val}
                    onChange={e => setCustom(c => ({ ...c, [key]: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-2">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('perDay')} ({dest.currency})</p>
          {dailyCny.map(c => (
            <div key={c.label} className="flex items-center justify-between text-sm">
              <span className="text-gray-500">{c.label}</span>
              <div className="text-right">
                <span className="text-gray-800 dark:text-gray-200 font-medium">{c.local.toLocaleString()} {dest.currency}</span>
                <span className="text-xs text-gray-400 ml-2">≈ ¥{c.cny.toLocaleString()}</span>
              </div>
            </div>
          ))}
          <div className="border-t border-gray-100 dark:border-gray-700 pt-2 flex justify-between font-semibold">
            <span className="text-gray-700 dark:text-gray-300">每日合计</span>
            <span className="text-indigo-600">¥{dailyTotal.toLocaleString()}</span>
          </div>
        </div>

        <div className="bg-indigo-600 rounded-xl p-4 text-white text-center">
          <div className="text-sm opacity-80">{days} 天预计总花费</div>
          <div className="text-3xl font-bold mt-1">¥{tripTotal.toLocaleString()}</div>
          <div className="text-xs opacity-70 mt-1">汇率参考：1 {dest.currency} ≈ ¥{rate}</div>
        </div>
      </div>
    </div>
  )
}
