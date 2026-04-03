import { defineToolManifest } from '@toolbox/tool-registry'
import { BookA } from 'lucide-react'

const toolGlossaryGenManifest = defineToolManifest({
  id: 'tool-glossary-gen',
  path: '/glossary-gen',
  namespace: 'toolGlossaryGen',
  mode: 'client',
  categoryKey: 'learn',
  icon: BookA,
  keywords: ['glossary', 'terms', 'dictionary', '术语', '词典'],
  meta: {
    zh: {
      title: '术语词典生成',
      description: '从一段材料中识别高频术语，生成可继续扩展的术语表',
    },
    en: {
      title: 'Glossary Generator',
      description: 'Detect repeated terms in a passage and turn them into a starter glossary',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolGlossaryGenManifest
