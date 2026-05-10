import { defineToolManifest } from '@toolbox/tool-registry'
import { PencilLine } from 'lucide-react'

const toolSentenceRewriterManifest = defineToolManifest({
  id: 'tool-sentence-rewriter',
  path: '/sentence-rewriter',
  namespace: 'toolSentenceRewriter',
  mode: 'client',
  categoryKey: 'learn',
  icon: PencilLine,
  keywords: ['sentence', 'rewrite', 'paraphrase', 'AI', '改写', '润色', '句子', '换种说法'],
  meta: {
    zh: {
      title: '句子改写器',
      description: '多种风格改写句子，让表达更丰富',
    },
    en: {
      title: 'Sentence Rewriter',
      description: 'Rewrite sentences in multiple styles for richer expression',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolSentenceRewriterManifest
