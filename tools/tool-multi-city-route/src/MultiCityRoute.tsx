import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MapPin, Plus, Trash2, Navigation } from 'lucide-react'
import { PageHero } from '@toolbox/ui-kit'

// 中国主要城市经纬度
const CITY_COORDS: Record<string, [number, number]> = {
  '北京': [116.4, 39.9], '上海': [121.5, 31.2], '广州': [113.3, 23.1], '深圳': [114.1, 22.5],
  '成都': [104.1, 30.6], '重庆': [106.5, 29.6], '杭州': [120.2, 30.3], '武汉': [114.3, 30.6],
  '西安': [108.9, 34.3], '南京': [118.8, 32.1], '苏州': [120.6, 31.3], '厦门': [118.1, 24.5],
  '青岛': [120.4, 36.1], '大连': [121.6, 38.9], '长沙': [113.0, 28.2], '郑州': [113.6, 34.7],
  '哈尔滨': [126.5, 45.8], '昆明': [102.7, 25.0], '三亚': [109.5, 18.3], '丽江': [100.2, 26.9],
  '东京': [139.7, 35.7], '首尔': [126.9, 37.6], '曼谷': [100.5, 13.8], '新加坡': [103.8, 1.3],
  '巴黎': [2.3, 48.9], '伦敦': [-0.1, 51.5], '纽约': [-74.0, 40.7], '悉尼': [151.2, -33.9],
}

function dist(a: [number, number], b: [number, number]): number {
  const R = 6371
  const dLat = (b[1] - a[1]) * Math.PI / 180
  const dLon = (b[0] - a[0]) * Math.PI / 180
  const lat1 = a[1] * Math.PI / 180
  const lat2 = b[1] * Math.PI / 180
  const x = Math.sin(dLat/2)**2 + Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLon/2)**2
  return Math.round(R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1-x)))
}

// 贪心最近邻 TSP
function greedyTSP(cities: string[]): { order: string[]; totalDist: number } {
  if (cities.length < 2) return { order: cities, totalDist: 0 }
  const visited = new Set<string>()
  const order: string[] = [cities[0]]
  visited.add(cities[0])
  let totalDist = 0
  while (order.length < cities.length) {
    const last = order[order.length - 1]
    const lastCoord = CITY_COORDS[last]
    let nearest = '', nearDist = Infinity
    for (const c of cities) {
      if (visited.has(c)) continue
      const coord = CITY_COORDS[c]
      if (!coord || !lastCoord) { nearest = c; break }
      const d = dist(lastCoord, coord)
      if (d < nearDist) { nearDist = d; nearest = c }
    }
    if (nearest) { order.push(nearest); visited.add(nearest); totalDist += nearDist }
  }
  return { order, totalDist }
}

export default function MultiCityRoute() {
  const { t } = useTranslation('toolMultiCityRoute')
  const [cities, setCities] = useState<string[]>(['北京', '上海', '成都'])
  const [input, setInput] = useState('')
  const [result, setResult] = useState<{ order: string[]; totalDist: number } | null>(null)

  const addCity = () => {
    const city = input.trim()
    if (!city || cities.includes(city)) return
    setCities(c => [...c, city])
    setInput('')
    setResult(null)
  }

  const removeCity = (i: number) => { setCities(c => c.filter((_, idx) => idx !== i)); setResult(null) }

  const optimize = () => {
    if (cities.length < 2) return
    setResult(greedyTSP(cities))
  }

  const suggestions = Object.keys(CITY_COORDS).filter(c => !cities.includes(c) && c.includes(input)).slice(0, 5)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHero title={t('title')} description={t('description')} icon={Navigation} />
      <div className="max-w-md mx-auto px-4 py-6 space-y-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
          <div className="relative">
            <div className="flex gap-2">
              <input value={input} onChange={e => { setInput(e.target.value); setResult(null) }}
                onKeyDown={e => e.key === 'Enter' && addCity()}
                placeholder={t('cityPlaceholder')}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
              <button onClick={addCity} className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {input && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-10 mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-10">
                {suggestions.map(s => (
                  <button key={s} onClick={() => { setCities(c => [...c, s]); setInput(''); setResult(null) }}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20">
                    <MapPin className="w-3.5 h-3.5 inline mr-1.5 text-indigo-400" />{s}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {cities.map((c, i) => (
              <div key={i} className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700 rounded-lg">
                <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-sm text-indigo-700 dark:text-indigo-300">{c}</span>
                <button onClick={() => removeCity(i)} className="text-indigo-300 hover:text-red-400 ml-1">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
          {cities.length < 2 && <p className="text-xs text-amber-500">{t('empty')}</p>}
          <button onClick={optimize} disabled={cities.length < 2}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-medium text-sm">
            {t('optimize')}
          </button>
        </div>

        {result && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('result')}</p>
              <span className="text-xs text-indigo-500 font-medium">{t('totalDistance')}: ~{result.totalDist.toLocaleString()} km</span>
            </div>
            <div className="space-y-2">
              {result.order.map((city, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-bold shrink-0">{i + 1}</div>
                  <div className="flex-1 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-indigo-400" />
                    <span className="text-sm text-gray-800 dark:text-gray-200">{city}</span>
                    {!CITY_COORDS[city] && <span className="text-xs text-amber-400">（未知位置）</span>}
                  </div>
                  {i < result.order.length - 1 && (
                    <span className="text-xs text-gray-400">
                      → {CITY_COORDS[city] && CITY_COORDS[result.order[i+1]] ? `${dist(CITY_COORDS[city], CITY_COORDS[result.order[i+1]])} km` : '?'}
                    </span>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400">{t('note')}</p>
          </div>
        )}
      </div>
    </div>
  )
}
