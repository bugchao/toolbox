import { defineToolManifest } from '@toolbox/tool-registry'
import { PenTool } from 'lucide-react'

const toolTravelStoryManifest = defineToolManifest({
  id: 'tool-travel-story',
  path: '/travel-story',
  namespace: 'toolTravelStory',
  mode: 'client',
  categoryKey: 'travel',
  icon: PenTool,
  keywords: ['travel', 'story', 'writing', 'AI', '旅行故事', '游记生成', 'AI写作', '旅行记录'],
  meta: {
    zh: {
      title: '旅行故事生成',
      description: 'AI 帮你把旅行经历变成精彩故事',
    },
    en: {
      title: 'Travel Story Generator',
      description: 'AI helps you turn travel experiences into wonderful stories',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolTravelStoryManifest
