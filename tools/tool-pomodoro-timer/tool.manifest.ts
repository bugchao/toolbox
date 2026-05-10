import { defineToolManifest } from '@toolbox/tool-registry'
import { Timer } from 'lucide-react'

const toolPomodoroTimerManifest = defineToolManifest({
  id: 'tool-pomodoro-timer',
  path: '/pomodoro-timer',
  namespace: 'toolPomodoroTimer',
  mode: 'client',
  categoryKey: 'life',
  icon: Timer,
  keywords: ['pomodoro', 'timer', 'focus', 'productivity', '番茄', '计时器', '专注', '极简'],
  meta: {
    zh: {
      title: '番茄钟计时器',
      description: '极简番茄工作法计时器，专注 25 分钟 + 5 分钟休息循环',
    },
    en: {
      title: 'Pomodoro Timer',
      description: 'Minimal Pomodoro technique timer with 25-minute focus and 5-minute break cycles',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolPomodoroTimerManifest
