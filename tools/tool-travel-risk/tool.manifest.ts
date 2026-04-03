import { defineToolManifest } from '@toolbox/tool-registry'
import { ShieldAlert } from 'lucide-react'

const toolTravelRiskManifest = defineToolManifest({
  id: 'tool-travel-risk',
  path: '/travel-risk',
  namespace: 'toolTravelRisk',
  mode: 'client',
  categoryKey: 'travel',
  icon: ShieldAlert,
  keywords: ['travel', 'risk', 'safety', '风险', '健康'],
  meta: {
    zh: {
      title: '旅行风险提醒',
      description: '从目的地、季节、健康需求和行程风格评估旅行风险',
    },
    en: {
      title: 'Travel Risk',
      description: 'Review travel risk from destination profile, season, health needs, and trip style',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolTravelRiskManifest
