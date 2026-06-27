import { defineToolManifest } from '@toolbox/tool-registry'
import { CalendarClock } from 'lucide-react'

const toolCronParserManifest = defineToolManifest({
  id: 'tool-cron-parser',
  path: '/cron-parser',
  namespace: 'toolCronParser',
  mode: 'client',
  categoryKey: 'dev',
  icon: CalendarClock,
  keywords: [
    'cron',
    'crontab',
    'cron 解析',
    '定时任务',
    '表达式',
    '下次运行',
    'schedule',
    'next run',
    'quartz',
    'parser',
    '解释',
    'expression',
  ],
  meta: {
    zh: {
      title: 'Cron 解析器',
      description: '把 cron 表达式翻译成人话，逐字段拆解并预测未来运行时间。',
    },
    en: {
      title: 'Cron Parser',
      description: 'Translate cron expressions to plain language and predict upcoming run times.',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolCronParserManifest
