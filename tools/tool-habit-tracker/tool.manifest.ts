import { defineToolManifest } from '@toolbox/tool-registry'
import { CheckCircle2 } from 'lucide-react'

const toolHabitTrackerManifest = defineToolManifest({
  id: 'tool-habit-tracker',
  path: '/habit-tracker',
  namespace: 'toolHabitTracker',
  mode: 'client',
  categoryKey: 'life',
  icon: CheckCircle2,
  keywords: ['habit', 'tracker', '习惯', '打卡', '追踪', 'streak'],
  meta: {
    zh: {
      title: '习惯打卡追踪器',
      description: '记录每日习惯，可视化坚持情况，养成好习惯',
    },
    en: {
      title: 'Habit Tracker',
      description: 'Track daily habits, visualize streaks, and build good habits.',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolHabitTrackerManifest
