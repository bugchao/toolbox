import { defineToolManifest } from '@toolbox/tool-registry'
import { Coins } from 'lucide-react'

const toolTravelCostCompareManifest = defineToolManifest({
  id: 'tool-travel-cost-compare',
  path: '/travel-cost-compare',
  namespace: 'toolTravelCostCompare',
  mode: 'client',
  categoryKey: 'travel',
  icon: Coins,
  keywords: ['travel', 'budget', 'compare', '旅行', '成本'],
  meta: {
    zh: {
      title: '旅行成本对比',
      description: '把多个目的地放到同一张表里，快速比较总成本和日均花费',
    },
    en: {
      title: 'Travel Cost Compare',
      description: 'Compare destinations side by side with total and per-day travel costs',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolTravelCostCompareManifest
