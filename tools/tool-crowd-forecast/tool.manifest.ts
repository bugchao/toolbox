import { defineToolManifest } from '@toolbox/tool-registry'
import { Users } from 'lucide-react'

const toolCrowdForecastManifest = defineToolManifest({
  id: 'tool-crowd-forecast',
  path: '/crowd-forecast',
  namespace: 'toolCrowdForecast',
  mode: 'client',
  categoryKey: 'travel',
  icon: Users,
  keywords: ['crowd', 'forecast', 'travel', '人流', '预测'],
  meta: {
    zh: {
      title: '人流预测',
      description: '基于场景、天气和节假日因素估算拥挤程度与排队风险',
    },
    en: {
      title: 'Crowd Forecast',
      description: 'Estimate crowding and queue risk based on venue, weather, and holiday pressure',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolCrowdForecastManifest
