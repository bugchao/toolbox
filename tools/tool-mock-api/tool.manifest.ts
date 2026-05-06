import { defineToolManifest } from '@toolbox/tool-registry'
import { Database } from 'lucide-react'

const toolMockApiManifest = defineToolManifest({
  id: 'tool-mock-api',
  path: '/mock-api',
  namespace: 'toolMockApi',
  mode: 'client',
  categoryKey: 'dev',
  icon: Database,
  keywords: ['mock', 'api', 'faker', 'test', 'data', 'generator', '测试数据', '模拟数据'],
  meta: {
    zh: {
      title: 'Mock API 生成器',
      description: '快速生成测试数据，支持多种数据类型和自定义结构',
    },
    en: {
      title: 'Mock API Generator',
      description: 'Quickly generate test data with various data types and custom structures',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolMockApiManifest
