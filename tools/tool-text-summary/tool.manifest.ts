import { FileText } from 'lucide-react'
import { defineToolManifest } from '@toolbox/tool-registry'

const toolTextSummaryManifest = defineToolManifest({
  id: 'tool-text-summary',
  path: '/text-summary',
  namespace: 'toolTextSummary',
  mode: 'client',
  categoryKey: 'learn',
  icon: FileText,
  keywords: ['文本摘要', 'summary', 'AI', '总结'],
  meta: {
    zh: {
      title: '文本摘要工具',
      description: '提取长文本关键信息并生成简洁摘要',
    },
    en: {
      title: 'Text Summary',
      description: 'Summarize long text into concise key points',
    },
  },
  loadComponent: () => import('./src/TextSummary'),
  loadMessages: {
    zh: () => import('./locales/zh-CN.json'),
    en: () => import('./locales/en-US.json'),
  },
})

export default toolTextSummaryManifest
