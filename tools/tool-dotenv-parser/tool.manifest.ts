import { defineToolManifest } from '@toolbox/tool-registry'
import { FileKey2 } from 'lucide-react'

const toolDotenvParserManifest = defineToolManifest({
  id: 'tool-dotenv-parser',
  path: '/dotenv-parser',
  namespace: 'toolDotenvParser',
  mode: 'client',
  categoryKey: 'dev',
  icon: FileKey2,
  keywords: [
    'dotenv',
    '.env',
    'env',
    'environment',
    '环境变量',
    '配置',
    'json',
    'yaml',
    'shell',
    'shell export',
    'export',
    '转换',
    'parser',
    '解析',
  ],
  meta: {
    zh: {
      title: '.env 解析转换',
      description: '解析 .env 并互转 JSON / YAML / Shell export，含校验提示，纯本地处理。',
    },
    en: {
      title: '.env Parser & Converter',
      description: 'Parse .env and convert to JSON / YAML / Shell export with validation, fully local.',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolDotenvParserManifest
