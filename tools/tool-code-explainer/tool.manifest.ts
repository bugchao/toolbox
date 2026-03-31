import { Code2 } from 'lucide-react'
import { defineToolManifest } from '@toolbox/tool-registry'

const toolCodeExplainerManifest = defineToolManifest({
  id: 'tool-code-explainer',
  path: '/code-explainer',
  namespace: 'toolCodeExplainer',
  mode: 'client',
  categoryKey: 'learn',
  icon: Code2,
  keywords: ['代码解释', 'code', 'AI', '学习'],
  meta: {
    zh: {
      title: '代码解释器',
      description: '逐段解释代码逻辑与关键实现',
    },
    en: {
      title: 'Code Explainer',
      description: 'Explain code logic and implementation details',
    },
  },
  loadComponent: () => import('./src/CodeExplainer'),
  loadMessages: {
    zh: () => import('./locales/zh-CN.json'),
    en: () => import('./locales/en-US.json'),
  },
})

export default toolCodeExplainerManifest
