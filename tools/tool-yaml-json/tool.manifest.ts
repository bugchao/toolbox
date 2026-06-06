import { defineToolManifest } from '@toolbox/tool-registry'
import { FileJson2 } from 'lucide-react'

const toolYamlJsonManifest = defineToolManifest({
  id: 'tool-yaml-json',
  path: '/yaml-json',
  namespace: 'toolYamlJson',
  mode: 'client',
  categoryKey: 'dev',
  icon: FileJson2,
  keywords: [
    'yaml',
    'json',
    'convert',
    'converter',
    'format',
    'parse',
    'dev',
    '转换',
    '格式',
    '互转',
  ],
  meta: {
    zh: {
      title: 'YAML ↔ JSON 互转',
      description: 'YAML 与 JSON 双向实时互转，支持自定义缩进、YAML 风格与错误行号高亮',
    },
    en: {
      title: 'YAML ↔ JSON Converter',
      description:
        'Convert between YAML and JSON in real time with custom indent, YAML style and error line highlighting',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolYamlJsonManifest
