import { defineToolManifest } from '@toolbox/tool-registry'
import { Map } from 'lucide-react'

const toolCityRouteManifest = defineToolManifest({
  id: 'tool-city-route',
  path: '/city-route',
  namespace: 'toolCityRoute',
  mode: 'client',
  categoryKey: 'travel',
  icon: Map,
  keywords: ['city', 'route', 'travel', 'planning', '城市路线', '景点规划', '路线生成', '旅游路线'],
  meta: {
    zh: {
      title: '城市游玩路线生成',
      description: '智能规划单城市景点路线',
    },
    en: {
      title: 'City Route Generator',
      description: 'Intelligently plan single-city attraction routes',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolCityRouteManifest
