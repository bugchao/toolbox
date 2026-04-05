import { defineToolManifest } from '@toolbox/tool-registry'
import { Mic } from 'lucide-react'

const toolPronunciationEvalManifest = defineToolManifest({
  id: 'tool-pronunciation-eval',
  path: '/pronunciation-eval',
  namespace: 'toolPronunciationEval',
  mode: 'client',
  categoryKey: 'learn',
  icon: Mic,
  keywords: ['pronunciation', 'evaluation', 'speech', '发音评估', '英语发音', '语音识别', '口语练习'],
  meta: {
    zh: {
      title: '发音评估工具',
      description: 'AI 评估你的英语发音，提供改进建议',
    },
    en: {
      title: 'Pronunciation Evaluation',
      description: 'AI evaluates your English pronunciation and provides improvement suggestions',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolPronunciationEvalManifest
