import { defineToolManifest } from '@toolbox/tool-registry'
import { Network } from 'lucide-react'

const toolKnowledgeGraphManifest = defineToolManifest({
  id: 'tool-knowledge-graph',
  path: '/knowledge-graph',
  namespace: 'toolKnowledgeGraph',
  mode: 'client',
  categoryKey: 'learn',
  icon: Network,
  keywords: ['knowledge', 'graph', 'concept', '知识图谱', '关系'],
  meta: {
    zh: {
      title: '知识图谱生成',
      description: '把概念关系整理成节点和边，便于继续做知识结构梳理',
    },
    en: {
      title: 'Knowledge Graph',
      description: 'Turn concept relationships into nodes and edges for structured learning maps',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolKnowledgeGraphManifest
