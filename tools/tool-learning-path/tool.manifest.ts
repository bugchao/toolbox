import { defineToolManifest } from '@toolbox/tool-registry'
import { Route } from 'lucide-react'

const toolLearningPathManifest = defineToolManifest({
  id: 'tool-learning-path',
  path: '/learning-path',
  namespace: 'toolLearningPath',
  mode: 'client',
  categoryKey: 'learn',
  icon: Route,
  keywords: ['learning', 'path', 'roadmap', '学习路径', '计划'],
  meta: {
    zh: {
      title: '学习路径规划',
      description: '按目标、当前水平和周期生成一条渐进式学习路线',
    },
    en: {
      title: 'Learning Path',
      description: 'Generate a staged study roadmap from your goal, level, and time window',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolLearningPathManifest
