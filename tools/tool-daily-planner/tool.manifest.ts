import { CalendarDays } from 'lucide-react'
import { defineToolManifest } from '@toolbox/tool-registry'

const toolDailyPlannerManifest = defineToolManifest({
  id: 'tool-daily-planner',
  path: '/daily-planner',
  namespace: 'toolDailyPlanner',
  mode: 'client',
  categoryKey: 'life',
  icon: CalendarDays,
  keywords: ['今日计划', '计划', '时间块', '任务管理'],
  meta: {
    zh: {
      title: '今日计划自动生成器',
      description: '规划每日时间块并追踪任务完成进度',
    },
    en: {
      title: 'Daily Planner',
      description: 'Plan time blocks and track task completion',
    },
  },
  loadComponent: () => import('./src/DailyPlanner'),
  loadMessages: {
    zh: () => import('./locales/zh-CN.json'),
    en: () => import('./locales/en-US.json'),
  },
})

export default toolDailyPlannerManifest
