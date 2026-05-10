import { defineToolManifest } from '@toolbox/tool-registry'
import { FileSearch } from 'lucide-react'

const toolPdfSummaryManifest = defineToolManifest({
  id: 'tool-pdf-summary',
  path: '/pdf-summary',
  namespace: 'toolPdfSummary',
  mode: 'client',
  categoryKey: 'learn',
  icon: FileSearch,
  keywords: ['pdf', 'summary', 'summarize', 'extract', 'AI', 'PDF', '总结', '摘要', '提取'],
  meta: {
    zh: {
      title: 'PDF 总结工具',
      description: '提取 PDF 全文，生成关键信息摘要与高频术语列表（纯前端处理，文件不上传）',
    },
    en: {
      title: 'PDF Summary',
      description: 'Extract text from PDF and generate concise key-point summary plus keyword list (fully client-side, no upload)',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolPdfSummaryManifest
