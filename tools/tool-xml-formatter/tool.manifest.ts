import { defineToolManifest } from '@toolbox/tool-registry'
import { FileCode } from 'lucide-react'

const toolXmlFormatterManifest = defineToolManifest({
  id: 'tool-xml-formatter',
  path: '/xml-formatter',
  namespace: 'toolXmlFormatter',
  mode: 'client',
  categoryKey: 'dev',
  icon: FileCode,
  keywords: ['xml', '格式化', '美化', '压缩', '校验', 'pretty', 'format', 'minify'],
  meta: {
    zh: {
      title: 'XML 格式化',
      description: 'XML 美化 / 压缩 / 校验：DOMParser 原生解析，自定义缩进，错误行号定位',
    },
    en: {
      title: 'XML Formatter',
      description: 'Pretty-print / minify / validate XML using native DOMParser, custom indent, error line locator',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolXmlFormatterManifest
