import { defineToolManifest } from '@toolbox/tool-registry'
import { Moon } from 'lucide-react'

const toolSleepTrackerManifest = defineToolManifest({
  id: 'tool-sleep-tracker',
  path: '/sleep-tracker',
  namespace: 'toolSleepTracker',
  mode: 'client',
  categoryKey: 'life',
  icon: Moon,
  keywords: ['sleep', 'tracker', 'quality', 'health', '睡眠记录', '睡眠质量', '睡眠追踪', '健康管理'],
  meta: {
    zh: {
      title: '睡眠质量记录',
      description: '记录每日睡眠，追踪睡眠质量',
    },
    en: {
      title: 'Sleep Quality Tracker',
      description: 'Record daily sleep and track sleep quality',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolSleepTrackerManifest
