import { defineToolManifest } from '@toolbox/tool-registry'
import { AlignJustify } from 'lucide-react'

const toolJsonlManifest = defineToolManifest({
  id: 'tool-jsonl',
  path: '/jsonl',
  namespace: 'toolJsonl',
  mode: 'client',
  categoryKey: 'dev',
  icon: AlignJustify,
  keywords: [
    'jsonl',
    'ndjson',
    'json lines',
    'json array',
    'convert',
    'validate',
    'json行',
    '日志',
    '数据流',
    '转换',
  ],
  meta: {
    zh: {
      title: 'JSON Lines 工具',
      description: 'NDJSON / JSON Lines ↔ JSON 数组互转，逐行校验报错（带行号），压缩规整。日志与数据流常用，纯本地。',
    },
    en: {
      title: 'JSON Lines Tool',
      description: 'Convert NDJSON / JSON Lines ↔ JSON array, validate each line with line numbers, and compact. Handy for logs and data streams. Fully local.',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolJsonlManifest
