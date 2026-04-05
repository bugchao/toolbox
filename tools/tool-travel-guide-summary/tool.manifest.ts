import { defineToolManifest } from '@toolbox/tool-registry'
import { FileText } from 'lucide-react'

const toolTravelGuideSummaryManifest = defineToolManifest({
  id: 'tool-travel-guide-summary',
  path: '/travel-guide-summary',
  namespace: 'toolTravelGuideSummary',
  mode: 'client',
  categoryKey: 'travel',
  icon: FileText,
  keywords: ['travel', 'guide', 'summary', 'AI', '旅行攻略', '攻略总结', 'AI总结', '旅游规划'],
  meta: {
    zh: {
      title: '旅行攻略总结器',
      description: 'AI 提取攻略要点，生成结构化总结',
    },
    en: {
      title: 'Travel Guide Summarizer',
      description: 'AI extracts key points from guides and generates structured summaries',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolTravelGuideSummaryManifest
