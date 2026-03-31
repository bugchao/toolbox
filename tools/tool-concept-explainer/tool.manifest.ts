import { Lightbulb } from 'lucide-react'
import { defineToolManifest } from '@toolbox/tool-registry'

const toolConceptExplainerManifest = defineToolManifest({
  id: 'tool-concept-explainer',
  path: '/concept-explainer',
  namespace: 'toolConceptExplainer',
  mode: 'client',
  categoryKey: 'learn',
  icon: Lightbulb,
  keywords: ['概念解释', 'concept', 'AI', '学习'],
  meta: {
    zh: {
      title: '概念解释工具',
      description: '用更易懂的方式解释复杂概念',
    },
    en: {
      title: 'Concept Explainer',
      description: 'Explain complex concepts in simple language',
    },
  },
  loadComponent: () => import('./src/ConceptExplainer'),
  loadMessages: {
    zh: () => import('./locales/zh-CN.json'),
    en: () => import('./locales/en-US.json'),
  },
})

export default toolConceptExplainerManifest
