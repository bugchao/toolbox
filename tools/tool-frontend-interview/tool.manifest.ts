import { defineToolManifest } from '@toolbox/tool-registry'
import { Braces } from 'lucide-react'

const toolFrontendInterviewManifest = defineToolManifest({
  id: 'tool-frontend-interview',
  path: '/frontend-interview',
  namespace: 'toolFrontendInterview',
  mode: 'client',
  categoryKey: 'learn',
  icon: Braces,
  keywords: ['frontend interview', '前端面试', 'react', 'css', 'performance'],
  meta: {
    zh: {
      title: '前端面试题生成',
      description: '根据方向和级别整理一组前端面试问题与追问',
    },
    en: {
      title: 'Frontend Interview',
      description: 'Create a focused frontend interview pack with questions and follow-ups',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolFrontendInterviewManifest
