import React, { useState, useCallback } from 'react'
import { MapPin, ArrowRight } from 'lucide-react'

// 知名城市坐标库
const CITIES: Record<string, { lat: number; lng: number; country: string }> = {
  '北京': { lat: 39.9042, lng: 116.4074, country: '中国' },
  '上海': { lat: 31.2304, lng: 121.4737, country: '中国' },
  '广州': { lat: 23.1291, lng: 113.2644, country: '中国' },
  '深圳': { lat: 22.5431, lng: 114.0579, country: '中国' },
  '杭州': { lat: 30.2741, lng: 120.1551, country: '中国' },
  '成都': { lat: 30.5728, lng: 104.0668, country: '中国' },
  '武汉': { lat: 30.5928, lng: 114.3055, country: '中国' },
  '西安': { lat: 34.3416, lng: 108.9398, country: '中国' },
  '香港': { lat: 22.3193, lng: 114.1694, country: '中国' },
  '台北': { lat: 25.0330, lng: 121.5654, country: '台湾' },
  '东京': { lat: 35.6762, lng: 139.6503, country: '日本' },
  '大阪': { lat: 34.6937, lng: 135.5023, country: '日本' },
  '首尔': { lat: 37.5665, lng: 126.9780, country: '韩国' },
  '新加坡': { lat: 1.3521, lng: 103.8198, country: '新加坡' },
  '曼谷': { lat: 13.7563, lng: 100.5018, country: '泰国' },
  '吉隆坡': { lat: 3.1390, lng: 101.6869, country: '马来西亚' },
  '悉尼': { lat: -33.8688, lng: 151.2093, country: '澳大利亚' },
  '迪拜': { lat: 25.2048, lng: 55.2708, country: '阿联酋' },
  '伦敦': { lat: 51.5074, lng: -0.1278, country: '英国' },
  '巴黎': { lat: 48.8566, lng: 2.3522, country: '法国' },
  '柏林': { lat: 52.5200, lng: 13.4050, country: '德国' },
  '莫斯科': { lat: 55.7558, lng: 37.6173, country: '俄罗斯' },
  '纽约': { lat: 40.7128, lng: -74.0060, country: '美国' },
  '洛杉矶': { lat: 34.0522, lng: -118.2437, country: '美国' },
  '旧金山': { lat: 37.7749, lng: -122.4194, country: '美国' },
}

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLng/2)**2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}

function flightTime(km: number): string {
  const hours = km / 800
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  return h > 0 ? `约 ${h}h${m > 0 ? m + 'm' : ''}` : `约 ${m}m`
}

const CitySelect = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
  <select value={value} onChange={e => onChange(e.target.value)}
    className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500">
    {Object.entries(CITIES).map(([name, info]) => (
      <option key={name} value={name}>{name}（{info.country}）</option>
    ))}
  </select>
)

export function DistanceCalc() {
  const [from, setFrom] = useState('北京')
  const [to, setTo] = useState('东京')
  const [customLat1, setCustomLat1] = useState('')
  const [customLng1, setCustomLng1] = useState('')
  const [customLat2, setCustomLat2] = useState('')
  const [customLng2, setCustomLng2] = useState('')
  const [mode, setMode] = useState<'city' | 'coord'>('city')

  const calc = useCallback(() => {
    if (mode === 'city') {
      const c1 = CITIES[from], c2 = CITIES[to]
      if (!c1 || !c2) return null
      return haversine(c1.lat, c1.lng, c2.lat, c2.lng)
    } else {
      const lat1 = parseFloat(customLat1), lng1 = parseFloat(customLng1)
      const lat2 = parseFloat(customLat2), lng2 = parseFloat(customLng2)
      if (isNaN(lat1) || isNaN(lng1) || isNaN(lat2) || isNaN(lng2)) return null
      return haversine(lat1, lng1, lat2, lng2)
    }
  }, [mode, from, to, customLat1, customLng1, customLat2, customLng2])

  const dist = calc()

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">地图距离计算</h1>
      <p className="text-gray-500 dark:text-gray-400">计算两城市或两坐标点之间的直线距离</p>

      {/* 模式切换 */}
      <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
        {(['city', 'coord'] as const).map(m => (
          <button key={m} onClick={() => setMode(m)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              mode === m ? 'bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-gray-100' : 'text-gray-500'
            }`}>{m === 'city' ? '城市选择' : '经纬度输入'}</button>
        ))}
      </div>

      {mode === 'city' ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-indigo-500 shrink-0" />
            <CitySelect value={from} onChange={setFrom} />
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
            <CitySelect value={to} onChange={setTo} />
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div><label className="text-xs text-gray-500">起点纬度</label>
              <input value={customLat1} onChange={e => setCustomLat1(e.target.value)} placeholder="39.9042"
                className="w-full px-3 py-2 mt-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-mono focus:outline-none" /></div>
            <div><label className="text-xs text-gray-500">起点经度</label>
              <input value={customLng1} onChange={e => setCustomLng1(e.target.value)} placeholder="116.4074"
                className="w-full px-3 py-2 mt-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-mono focus:outline-none" /></div>
            <div><label className="text-xs text-gray-500">终点纬度</label>
              <input value={customLat2} onChange={e => setCustomLat2(e.target.value)} placeholder="35.6762"
                className="w-full px-3 py-2 mt-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-mono focus:outline-none" /></div>
            <div><label className="text-xs text-gray-500">终点经度</label>
              <input value={customLng2} onChange={e => setCustomLng2(e.target.value)} placeholder="139.6503"
                className="w-full px-3 py-2 mt-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-mono focus:outline-none" /></div>
          </div>
        </div>
      )}

      {/* 结果 */}
      {dist !== null && (
        <>
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-5 text-white">
            <div className="flex items-center gap-3 mb-3">
              <span className="font-medium">{mode === 'city' ? from : '起点'}</span>
              <ArrowRight className="w-4 h-4 opacity-70" />
              <span className="font-medium">{mode === 'city' ? to : '终点'}</span>
            </div>
            <div className="text-4xl font-bold">{dist.toFixed(0)} km</div>
            <div className="text-sm opacity-70 mt-1">{(dist * 0.621371).toFixed(0)} 英里</div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: '飞机', speed: 800, icon: '✈️' },
              { label: '高铁', speed: 300, icon: '🚄' },
              { label: '驾车', speed: 100, icon: '🚗' },
            ].map(({ label, speed, icon }) => (
              <div key={label} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 text-center">
                <div className="text-2xl mb-1">{icon}</div>
                <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{flightTime(dist / (speed / 800) * (800 / speed) * speed)}</div>
                <div className="text-xs text-gray-400">{label} {speed}km/h</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
