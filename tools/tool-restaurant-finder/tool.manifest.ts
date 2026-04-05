import { defineToolManifest } from '@toolbox/tool-registry'
import { UtensilsCrossed } from 'lucide-react'

const toolRestaurantFinderManifest = defineToolManifest({
  id: 'tool-restaurant-finder',
  path: '/restaurant-finder',
  namespace: 'toolRestaurantFinder',
  mode: 'client',
  categoryKey: 'travel',
  icon: UtensilsCrossed,
  keywords: ['restaurant', 'food', 'dining', 'finder', '餐厅推荐', '美食搜索', '餐厅查询', '用餐推荐'],
  meta: {
    zh: {
      title: '餐厅推荐',
      description: '根据时间、预算和偏好，找到最适合的餐厅',
    },
    en: {
      title: 'Restaurant Finder',
      description: 'Find the best restaurants based on time, budget and preferences',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolRestaurantFinderManifest
