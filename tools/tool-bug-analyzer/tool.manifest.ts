import { Bug } from 'lucide-react'
import { defineToolManifest } from '@toolbox/tool-registry'

const toolBugAnalyzerManifest = defineToolManifest({
  id: 'tool-bug-analyzer',
  path: '/bug-analyzer',
  namespace: 'toolBugAnalyzer',
  mode: 'client',
  categoryKey: 'learn',
  icon: Bug,
  keywords: ['Bug', '缺陷分析', '调试', 'AI'],
  meta: {
    zh: {
      title: 'Bug 分析工具',
      description: '分析报错信息并给出定位与修复建议',
    },
    en: {
      title: 'Bug Analyzer',
      description: 'Analyze errors and suggest root cause and fixes',
    },
  },
  loadComponent: () => import('./src/BugAnalyzer'),
  loadMessages: {
    zh: () => import('./locales/zh-CN.json'),
    en: () => import('./locales/en-US.json'),
  },
})

export default toolBugAnalyzerManifest
