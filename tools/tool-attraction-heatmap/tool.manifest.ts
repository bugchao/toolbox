import { defineToolManifest } from '@toolbox/tool-registry'
import { MapPinned } from 'lucide-react'

const toolAttractionHeatmapManifest = defineToolManifest({
  id: 'tool-attraction-heatmap',
  path: '/attraction-heatmap',
  namespace: 'toolAttractionHeatmap',
  mode: 'client',
  categoryKey: 'travel',
  icon: MapPinned,
  keywords: ['travel', 'attraction', 'heatmap', '景点', '热度'],
  meta: {
    zh: {
      title: '景点热度分析',
      description: '按景点类型、日期和到达时段推演人流热度，帮助避开高峰',
    },
    en: {
      title: 'Attraction Heatmap',
      description: 'Estimate visitor heat by attraction type, day profile, and arrival time',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolAttractionHeatmapManifest
