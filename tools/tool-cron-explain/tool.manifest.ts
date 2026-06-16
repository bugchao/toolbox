import { defineToolManifest } from '@toolbox/tool-registry'
import { CalendarClock } from 'lucide-react'

const toolCronExplainManifest = defineToolManifest({
  id: 'tool-cron-explain',
  path: '/cron-explain',
  namespace: 'toolCronExplain',
  mode: 'client',
  categoryKey: 'dev',
  icon: CalendarClock,
  keywords: [
    'cron',
    'crontab',
    'schedule',
    'next run',
    'explain',
    'parse',
    '定时',
    '解析',
    '下次运行',
    '表达式',
  ],
  meta: {
    zh: {
      title: 'Cron 表达式解析',
      description: '粘贴标准 5 字段 cron 表达式，解析成人类可读描述并列出接下来若干次执行时间；支持 */ , - 区间步进、月份/星期别名、DOM∨DOW 语义。',
    },
    en: {
      title: 'Cron Explainer',
      description: 'Parse a standard 5-field cron expression into a human-readable description and list the next run times; supports */ , - steps, month/weekday aliases, and DOM∨DOW semantics.',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolCronExplainManifest
