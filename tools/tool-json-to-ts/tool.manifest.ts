import { defineToolManifest } from '@toolbox/tool-registry'
import { Braces } from 'lucide-react'

const toolJsonToTsManifest = defineToolManifest({
  id: 'tool-json-to-ts',
  path: '/json-to-ts',
  namespace: 'toolJsonToTs',
  mode: 'client',
  categoryKey: 'dev',
  icon: Braces,
  keywords: [
    'json',
    'typescript',
    'interface',
    'type',
    'codegen',
    'json-to-ts',
    'json转ts',
    '类型生成',
    '接口',
  ],
  meta: {
    zh: {
      title: 'JSON 转 TypeScript',
      description: '把 JSON 转换成 TypeScript interface / type 类型定义，自动推断可选字段与数组类型合并。',
    },
    en: {
      title: 'JSON to TypeScript',
      description: 'Convert JSON into TypeScript interface / type definitions with smart optional and array-merging inference.',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolJsonToTsManifest
