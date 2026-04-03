import { AlignLeft } from 'lucide-react'
import { defineToolManifest } from '@toolbox/tool-registry'

const toolTextStatsManifest = defineToolManifest({
  id: 'tool-text-stats',
  path: '/text-stats',
  namespace: 'toolTextStats',
  mode: 'client',
  categoryKey: 'dev',
  icon: AlignLeft,
  keywords: ['text', 'stats', 'word count', '字符', '字数'],
  meta: {
    zh: {
      title: '文本统计',
      description: '统计字符、词数、段落、句子和预估阅读时间',
    },
    en: {
      title: 'Text Stats',
      description: 'Count characters, words, paragraphs, sentences, and reading time',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolTextStatsManifest
