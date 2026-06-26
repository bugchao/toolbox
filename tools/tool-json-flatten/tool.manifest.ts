import { defineToolManifest } from '@toolbox/tool-registry'
import { ListTree } from 'lucide-react'

const toolJsonFlattenManifest = defineToolManifest({
  id: 'tool-json-flatten',
  path: '/json-flatten',
  namespace: 'toolJsonFlatten',
  mode: 'client',
  categoryKey: 'dev',
  icon: ListTree,
  keywords: [
    'json',
    'flatten',
    'csv',
    'json to csv',
    'dot path',
    'table',
    'json扁平化',
    '扁平化',
    '路径',
    '展开',
    '表格',
    '转csv',
  ],
  meta: {
    zh: {
      title: 'JSON Flatten',
      description: '嵌套 JSON 扁平化为点路径键，可导出 CSV；对象数组转表格。纯本地。',
    },
    en: {
      title: 'JSON Flatten',
      description: 'Flatten nested JSON into dot-path keys and export CSV; turns object arrays into tables. Fully local.',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolJsonFlattenManifest
