import { defineToolManifest } from '@toolbox/tool-registry'
import { ScanSearch } from 'lucide-react'

const toolDeepDiveQaManifest = defineToolManifest({
  id: 'tool-deep-dive-qa',
  path: '/deep-dive-qa',
  namespace: 'toolDeepDiveQa',
  mode: 'client',
  categoryKey: 'learn',
  icon: ScanSearch,
  keywords: ['deep dive qa', '深挖问答', '复盘', '专题问答'],
  meta: {
    zh: {
      title: '深挖问答助手',
      description: '围绕主题生成递进式问题和回答骨架，适合复盘与讲解',
    },
    en: {
      title: 'Deep Dive Q&A',
      description: 'Create layered questions and answer scaffolds for a topic deep dive',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolDeepDiveQaManifest
