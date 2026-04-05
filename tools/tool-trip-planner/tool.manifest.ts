import { defineToolManifest } from '@toolbox/tool-registry'
import { MapPin } from 'lucide-react'

const toolTripPlannerManifest = defineToolManifest({
  id: 'tool-trip-planner',
  path: '/trip-planner',
  namespace: 'toolTripPlanner',
  mode: 'client',
  categoryKey: 'travel',
  icon: MapPin,
  keywords: ['trip', 'planner', 'travel', 'AI', '行程规划', '旅行计划', 'AI规划', '旅游攻略'],
  meta: {
    zh: {
      title: 'AI 行程规划器',
      description: '输入预算和天数，AI 生成个性化旅行计划',
    },
    en: {
      title: 'AI Trip Planner',
      description: 'Enter budget and days, AI generates personalized travel plans',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolTripPlannerManifest
