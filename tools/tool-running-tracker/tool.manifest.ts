import { defineToolManifest } from '@toolbox/tool-registry'
import { Activity } from 'lucide-react'

const toolRunningTrackerManifest = defineToolManifest({
  id: 'tool-running-tracker',
  path: '/running-tracker',
  namespace: 'toolRunningTracker',
  mode: 'client',
  categoryKey: 'life',
  icon: Activity,
  keywords: ['running', 'tracker', 'pace', 'exercise', '跑步记录', '配速分析', '运动数据', '健康管理'],
  meta: {
    zh: {
      title: '跑步数据分析',
      description: '记录跑步数据，分析配速和趋势',
    },
    en: {
      title: 'Running Data Analysis',
      description: 'Track running data and analyze pace and trends',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolRunningTrackerManifest
