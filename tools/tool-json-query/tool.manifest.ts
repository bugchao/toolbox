import { defineToolManifest } from '@toolbox/tool-registry'
import { Search } from 'lucide-react'

const toolJsonQueryManifest = defineToolManifest({
  id: 'tool-json-query',
  path: '/json-query',
  namespace: 'toolJsonQuery',
  mode: 'client',
  categoryKey: 'dev',
  icon: Search,
  keywords: [
    'json',
    'jsonpath',
    'query',
    'path',
    'extract',
    'wildcard',
    'json查询',
    '路径',
    '提取',
    '通配',
  ],
  meta: {
    zh: {
      title: 'JSON 路径查询',
      description: '用点号/方括号路径从 JSON 取值：支持 .key、[0]、[-1]、* 通配、[1:3] 切片与嵌套展开；实时显示所有匹配。纯本地。',
    },
    en: {
      title: 'JSON Path Query',
      description: 'Extract values from JSON with a dot/bracket path: .key, [0], [-1], * wildcard, [1:3] slices and nested flattening — all matches shown live. Fully local.',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolJsonQueryManifest
