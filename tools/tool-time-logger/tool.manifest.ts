import { defineToolManifest } from '@toolbox/tool-registry'
import { Clock } from 'lucide-react'

const toolTimeLoggerManifest = defineToolManifest({
  id: 'tool-time-logger',
  path: '/time-logger',
  namespace: 'toolTimeLogger',
  mode: 'client',
  categoryKey: 'life',
  icon: Clock,
  keywords: ['time', 'tracking', 'logger', 'productivity', '时间管理', '时间追踪', '时间日志', '效率分析'],
  meta: {
    zh: {
      title: '时间日志分析',
      description: '记录和分析你的时间都去哪了，优化时间分配',
    },
    en: {
      title: 'Time Logger',
      description: 'Track and analyze where your time goes, optimize time allocation',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolTimeLoggerManifest
