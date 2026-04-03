import { defineToolManifest } from '@toolbox/tool-registry'
import { FileSearch } from 'lucide-react'

const toolWebExtractorManifest = defineToolManifest({
  id: 'tool-web-extractor',
  path: '/web-extractor',
  namespace: 'toolWebExtractor',
  mode: 'client',
  categoryKey: 'learn',
  icon: FileSearch,
  keywords: ['web', 'extractor', 'article', '网页', '提取'],
  meta: {
    zh: {
      title: '网页内容提取',
      description: '从网页源码或正文片段中提取标题、层级和核心句子',
    },
    en: {
      title: 'Web Extractor',
      description: 'Pull titles, headings, and key sentences from HTML or copied article text',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolWebExtractorManifest
