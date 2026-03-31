import { Moon } from 'lucide-react'
import { defineToolManifest } from '@toolbox/tool-registry'

const toolSleepTrackerManifest = defineToolManifest({
  id: 'tool-sleep-tracker',
  path: '/sleep-tracker',
  namespace: 'toolSleepTracker',
  mode: 'client',
  categoryKey: 'life',
  icon: Moon,
  keywords: ['睡眠', '睡眠质量', '记录', '健康'],
  meta: {
    zh: {
      title: '睡眠质量记录',
      description: '记录睡眠时长与质量，查看趋势变化',
    },
    en: {
      title: 'Sleep Tracker',
      description: 'Track sleep duration and quality trends',
    },
  },
  loadComponent: () => import('./src/SleepTracker'),
  loadMessages: {
    zh: () => import('./locales/zh-CN.json'),
    en: () => import('./locales/en-US.json'),
  },
})

export default toolSleepTrackerManifest
