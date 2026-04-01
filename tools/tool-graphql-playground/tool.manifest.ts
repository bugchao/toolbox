import { GitGraph } from 'lucide-react'
import { defineToolManifest } from '@toolbox/tool-registry'

const toolGraphqlPlaygroundManifest = defineToolManifest({
  id: 'tool-graphql-playground',
  path: '/graphql-playground',
  namespace: 'toolGraphqlPlayground',
  mode: 'client',
  categoryKey: 'dev',
  icon: GitGraph,
  keywords: ['graphql', 'api', 'schema', 'playground'],
  meta: {
    zh: {
      title: 'GraphQL Playground',
      description: '编写查询、变量和请求头，快速调试 GraphQL 接口',
    },
    en: {
      title: 'GraphQL Playground',
      description: 'Debug GraphQL APIs with queries, variables, and headers',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolGraphqlPlaygroundManifest
