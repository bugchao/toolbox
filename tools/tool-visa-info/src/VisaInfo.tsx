import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Globe } from 'lucide-react'
import { PageHero } from '@toolbox/ui-kit'

type VisaType = 'visaFree' | 'visaOnArrival' | 'eVisa' | 'required'

interface Country {
  name: string
  continent: string
  visaType: VisaType
  duration: number
  note: string
}

const COUNTRIES: Country[] = [
  { name: '新加坡', continent: '亚洲', visaType: 'visaFree', duration: 30, note: '持普通护照免签' },
  { name: '马来西亚', continent: '亚洲', visaType: 'visaFree', duration: 30, note: '持普通护照免签' },
  { name: '泰国', continent: '亚洲', visaType: 'visaFree', duration: 30, note: '2023年起免签' },
  { name: '哈萨克斯坦', continent: '亚洲', visaType: 'visaFree', duration: 14, note: '单次入境' },
  { name: '格鲁吉亚', continent: '亚洲', visaType: 'visaFree', duration: 365, note: '一年内累计不超过365天' },
  { name: '亚美尼亚', continent: '亚洲', visaType: 'visaFree', duration: 180, note: '180天内最多90天' },
  { name: '塔吉克斯坦', continent: '亚洲', visaType: 'eVisa', duration: 45, note: '可在线申请电子签' },
  { name: '印度尼西亚', continent: '亚洲', visaType: 'visaFree', duration: 30, note: '巴厘岛等旅游区免签' },
  { name: '菲律宾', continent: '亚洲', visaType: 'visaFree', duration: 30, note: '持普通护照免签' },
  { name: '越南', continent: '亚洲', visaType: 'eVisa', duration: 90, note: '可申请电子签，已有免签协议' },
  { name: '柬埔寨', continent: '亚洲', visaType: 'visaOnArrival', duration: 30, note: '落地签30美元' },
  { name: '日本', continent: '亚洲', visaType: 'required', duration: 0, note: '需提前申请签证' },
  { name: '韩国', continent: '亚洲', visaType: 'required', duration: 0, note: '需提前申请，部分城市中转免签' },
  { name: '印度', continent: '亚洲', visaType: 'eVisa', duration: 30, note: '可申请e-Visa' },
  { name: '斯里兰卡', continent: '亚洲', visaType: 'eVisa', duration: 30, note: '电子旅游签' },
  { name: '摩洛哥', continent: '非洲', visaType: 'visaFree', duration: 90, note: '免签90天' },
  { name: '埃及', continent: '非洲', visaType: 'visaOnArrival', duration: 30, note: '落地签25美元' },
  { name: '肯尼亚', continent: '非洲', visaType: 'eVisa', duration: 90, note: '在线申请电子签' },
  { name: '坦桑尼亚', continent: '非洲', visaType: 'visaOnArrival', duration: 90, note: '落地签50美元' },
  { name: '南非', continent: '非洲', visaType: 'required', duration: 0, note: '需提前申请' },
  { name: '英国', continent: '欧洲', visaType: 'required', duration: 0, note: '需提前申请' },
  { name: '法国', continent: '欧洲', visaType: 'required', duration: 0, note: '申根签证' },
  { name: '德国', continent: '欧洲', visaType: 'required', duration: 0, note: '申根签证' },
  { name: '意大利', continent: '欧洲', visaType: 'required', duration: 0, note: '申根签证' },
  { name: '西班牙', continent: '欧洲', visaType: 'required', duration: 0, note: '申根签证' },
  { name: '葡萄牙', continent: '欧洲', visaType: 'required', duration: 0, note: '申根签证' },
  { name: '塞尔维亚', continent: '欧洲', visaType: 'visaFree', duration: 30, note: '免签30天' },
  { name: '俄罗斯', continent: '欧洲', visaType: 'eVisa', duration: 16, note: '电子签16天' },
  { name: '美国', continent: '美洲', visaType: 'required', duration: 0, note: '需申请B1/B2签证' },
  { name: '加拿大', continent: '美洲', visaType: 'required', duration: 0, note: '需申请访客签证' },
  { name: '墨西哥', continent: '美洲', visaType: 'visaFree', duration: 180, note: '免签最长180天' },
  { name: '巴西', continent: '美洲', visaType: 'visaFree', duration: 90, note: '2024年起免签' },
  { name: '阿根廷', continent: '美洲', visaType: 'visaFree', duration: 90, note: '免签90天' },
  { name: '秘鲁', continent: '美洲', visaType: 'visaFree', duration: 183, note: '免签最长183天' },
  { name: '澳大利亚', continent: '大洋洲', visaType: 'eVisa', duration: 90, note: '需申请ETA或eVisitor' },
  { name: '新西兰', continent: '大洋洲', visaType: 'eVisa', duration: 90, note: '需申请NZeTA' },
  { name: '斐济', continent: '大洋洲', visaType: 'visaFree', duration: 120, note: '免签120天' },
]

const VISA_BADGE: Record<VisaType, { label: string; color: string }> = {
  visaFree: { label: '免签', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  visaOnArrival: { label: '落地签', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  eVisa: { label: '电子签', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  required: { label: '需签证', color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
}

const CONTINENTS = ['全部', ...Array.from(new Set(COUNTRIES.map(c => c.continent)))]
const VISA_TYPES: (VisaType | 'all')[] = ['all', 'visaFree', 'visaOnArrival', 'eVisa', 'required']

export default function VisaInfo() {
  const { t } = useTranslation('toolVisaInfo')
  const [search, setSearch] = useState('')
  const [continent, setContinent] = useState('全部')
  const [visaFilter, setVisaFilter] = useState<VisaType | 'all'>('all')

  const filtered = COUNTRIES.filter(c => {
    const matchC = continent === '全部' || c.continent === continent
    const matchV = visaFilter === 'all' || c.visaType === visaFilter
    const matchS = !search || c.name.includes(search)
    return matchC && matchV && matchS
  })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHero title={t('title')} description={t('description')} icon={Globe} />
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder={t('search')}
          className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500" />

        <div className="flex gap-2 flex-wrap">
          {CONTINENTS.map(c => (
            <button key={c} onClick={() => setContinent(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                continent === c ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600'
              }`}>{c}</button>
          ))}
        </div>

        <div className="flex gap-2 flex-wrap">
          {VISA_TYPES.map(v => {
            const badge = v === 'all' ? { label: t('all'), color: '' } : VISA_BADGE[v]
            return (
              <button key={v} onClick={() => setVisaFilter(v)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  visaFilter === v ? 'bg-gray-800 text-white' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600'
                }`}>{badge.label}</button>
            )
          })}
        </div>

        <div className="grid grid-cols-1 gap-2">
          {filtered.map((c, i) => {
            const badge = VISA_BADGE[c.visaType]
            return (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 flex items-center gap-3">
                <div className="text-xl">🌏</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">{c.name}</span>
                    <span className="text-xs text-gray-400">{c.continent}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badge.color}`}>{badge.label}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {c.duration > 0 ? `最长停留 ${c.duration} 天 · ` : ''}{c.note}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        <p className="text-xs text-center text-gray-400">{t('disclaimer')}</p>
      </div>
    </div>
  )
}
