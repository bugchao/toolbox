import { defineToolManifest } from '@toolbox/tool-registry'
import { Languages } from 'lucide-react'

const toolTranslationHubManifest = defineToolManifest({
  id: 'tool-translation-hub',
  path: '/translation-hub',
  namespace: 'toolTranslationHub',
  mode: 'client',
  categoryKey: 'utils',
  icon: Languages,
  keywords: ['translate', 'translation', 'google', 'bing', 'baidu', '翻译', '语言'],
  meta: {
    zh: {
      title: '翻译工作台',
      description: '统一输入语言与文本，在 Google、Bing、百度等翻译服务之间快速切换或并排查看',
    },
    en: {
      title: 'Translation Hub',
      description: 'Use one input flow across Google, Bing, Baidu, and other translation services with switchable or parallel views',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolTranslationHubManifest
