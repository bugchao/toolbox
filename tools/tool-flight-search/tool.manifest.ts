import { defineToolManifest } from '@toolbox/tool-registry'
import { Plane } from 'lucide-react'

const toolFlightSearchManifest = defineToolManifest({
  id: 'tool-flight-search',
  path: '/flight-search',
  namespace: 'toolFlightSearch',
  mode: 'client',
  categoryKey: 'travel',
  icon: Plane,
  keywords: ['flight', 'search', 'ticket', 'booking', '航班查询', '机票搜索', '航班比价', '机票预订'],
  meta: {
    zh: {
      title: '航班信息查询',
      description: '聚合多个平台的航班信息，快速找到最优航班',
    },
    en: {
      title: 'Flight Search',
      description: 'Aggregate flight information from multiple platforms to find the best flights',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolFlightSearchManifest
