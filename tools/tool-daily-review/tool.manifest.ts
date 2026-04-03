import { defineToolManifest } from '@toolbox/tool-registry'
import { NotebookPen } from 'lucide-react'

const toolDailyReviewManifest = defineToolManifest({
  id: 'tool-daily-review',
  path: '/daily-review',
  namespace: 'toolDailyReview',
  mode: 'client',
  categoryKey: 'life',
  icon: NotebookPen,
  keywords: ['review', 'reflection', 'journal', '复盘', '每日'],
  meta: {
    zh: {
      title: '每日复盘生成器',
      description: '整理当天进展、阻碍和教训，自动生成明日关注点',
    },
    en: {
      title: 'Daily Review',
      description: 'Turn wins, blockers, and lessons into a clear next-day review',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolDailyReviewManifest
