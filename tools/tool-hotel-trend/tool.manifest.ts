import { defineToolManifest } from '@toolbox/tool-registry'
import { TrendingUp } from 'lucide-react'

const toolHotelTrendManifest = defineToolManifest({
  id: 'tool-hotel-trend',
  path: '/hotel-trend',
  namespace: 'toolHotelTrend',
  mode: 'client',
  categoryKey: 'travel',
  icon: TrendingUp,
  keywords: ['hotel', 'price', 'trend', 'booking', '酒店价格', '价格趋势', '酒店预订', '价格分析'],
  meta: {
    zh: {
      title: '酒店价格趋势',
      description: '查看酒店价格变化，选择最佳预订时机',
    },
    en: {
      title: 'Hotel Price Trends',
      description: 'View hotel price changes and choose the best booking time',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolHotelTrendManifest
