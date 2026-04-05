import { defineToolManifest } from '@toolbox/tool-registry'
import { BookOpen } from 'lucide-react'

const toolTravelJournalManifest = defineToolManifest({
  id: 'tool-travel-journal',
  path: '/travel-journal',
  namespace: 'toolTravelJournal',
  mode: 'client',
  categoryKey: 'travel',
  icon: BookOpen,
  keywords: ['travel', 'journal', 'diary', 'generator', '游记生成', '旅行日记', '自动生成', '旅行记录'],
  meta: {
    zh: {
      title: '游记自动生成',
      description: '记录每一天的旅行，自动生成精美游记',
    },
    en: {
      title: 'Travel Journal Generator',
      description: 'Record each day of travel and automatically generate beautiful journals',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolTravelJournalManifest
