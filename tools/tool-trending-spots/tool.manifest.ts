import { defineToolManifest } from '@toolbox/tool-registry'
import { TrendingUp } from 'lucide-react'

const toolTrendingSpotsManifest = defineToolManifest({
  id: 'tool-trending-spots',
  path: '/trending-spots',
  namespace: 'toolTrendingSpots',
  mode: 'client',
  categoryKey: 'travel',
  icon: TrendingUp,
  keywords: ['trending', 'spots', 'travel', 'popular', '网红景点', '打卡地', '旅游推荐', '热门景点'],
  meta: {
    zh: {
      title: '网红景点生成器',
      description: '发现热门打卡点，记录美好瞬间',
    },
    en: {
      title: 'Trending Spots Generator',
      description: 'Discover popular check-in spots and capture beautiful moments',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolTrendingSpotsManifest
