import { defineToolManifest } from '@toolbox/tool-registry'
import { ArrowLeftRight } from 'lucide-react'

const toolTomlJsonManifest = defineToolManifest({
  id: 'tool-toml-json',
  path: '/toml-json',
  namespace: 'toolTomlJson',
  mode: 'client',
  categoryKey: 'dev',
  icon: ArrowLeftRight,
  keywords: [
    'toml', 'json', 'convert', 'parse', 'config', 'cargo', 'pyproject',
    '配置', '转换', '互转',
  ],
  meta: {
    zh: {
      title: 'TOML ↔ JSON 互转',
      description: '双向实时互转 TOML 与 JSON，支持嵌套表、数组、行内表；错误带行号，配置文件场景常用。',
    },
    en: {
      title: 'TOML ↔ JSON',
      description: 'Bi-directional live conversion between TOML and JSON with line-numbered errors. Handy for Cargo, pyproject and other config files.',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolTomlJsonManifest
