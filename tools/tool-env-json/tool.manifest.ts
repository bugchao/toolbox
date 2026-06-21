import { defineToolManifest } from '@toolbox/tool-registry'
import { FileCog } from 'lucide-react'

const toolEnvJsonManifest = defineToolManifest({
  id: 'tool-env-json',
  path: '/env-json',
  namespace: 'toolEnvJson',
  mode: 'client',
  categoryKey: 'dev',
  icon: FileCog,
  keywords: [
    'env',
    'dotenv',
    'json',
    'convert',
    'config',
    'environment',
    '环境变量',
    '配置',
    '转换',
    '互转',
  ],
  meta: {
    zh: {
      title: '.env ↔ JSON 互转',
      description: '双向实时互转 .env 与扁平 JSON：支持 export 前缀、单/双引号转义、跨行值、行内注释；嵌套对象自动转 JSON 串。',
    },
    en: {
      title: '.env ↔ JSON',
      description: 'Bi-directional live conversion between .env and flat JSON: export prefix, single/double-quote escapes, multi-line values, inline comments; nested objects become JSON strings.',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolEnvJsonManifest
