import { defineToolManifest } from '@toolbox/tool-registry'
import { Route } from 'lucide-react'

const toolRouteMapManifest = defineToolManifest({
  id: 'tool-route-map',
  path: '/route-map',
  namespace: 'toolRouteMap',
  mode: 'client',
  categoryKey: 'travel',
  icon: Route,
  keywords: ['route', 'map', 'timeline', '路线', '行程'],
  meta: {
    zh: {
      title: '路线地图可视化',
      description: '把停靠点整理成可执行的路线时间线，方便出发前排程',
    },
    en: {
      title: 'Route Map',
      description: 'Turn a list of stops into a simple route timeline before the trip starts',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolRouteMapManifest
