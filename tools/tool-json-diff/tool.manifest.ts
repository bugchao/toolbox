import { defineToolManifest } from '@toolbox/tool-registry'
import { GitCompareArrows } from 'lucide-react'

const toolJsonDiffManifest = defineToolManifest({
  id: 'tool-json-diff',
  path: '/json-diff',
  namespace: 'toolJsonDiff',
  mode: 'client',
  categoryKey: 'dev',
  icon: GitCompareArrows,
  keywords: [
    'json',
    'diff',
    'compare',
    'difference',
    'json diff',
    'json compare',
    'structural',
    'json对比',
    'json比较',
    '差异',
    '对比',
    '比较',
  ],
  meta: {
    zh: {
      title: 'JSON Diff',
      description: '两份 JSON 结构化对比，忽略键顺序，标出新增/删除/修改与类型变化。纯本地。',
    },
    en: {
      title: 'JSON Diff',
      description: 'Structural diff of two JSON docs — ignores key order, highlights added/removed/changed. Fully local.',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolJsonDiffManifest
