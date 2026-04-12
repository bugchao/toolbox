import { defineToolManifest } from '@toolbox/tool-registry'
import { Globe2 } from 'lucide-react'

const toolIdnConverterManifest = defineToolManifest({
  id: 'tool-idn-converter',
  path: '/idn-converter',
  namespace: 'toolIdnConverter',
  mode: 'client',
  categoryKey: 'domain',
  icon: Globe2,
  keywords: ['idn', 'punycode', '中文域名', '国际化域名', 'unicode'],
  meta: {
    zh: {
      title: '中文域名转换',
      description: '在 Unicode 域名和 Punycode 之间双向转换，并拆解每个标签方便核对。',
    },
    en: {
      title: 'IDN Converter',
      description: 'Convert between Unicode domains and Punycode with per-label inspection for validation.',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolIdnConverterManifest
