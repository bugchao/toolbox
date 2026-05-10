import { defineToolManifest } from '@toolbox/tool-registry'
import { Paintbrush } from 'lucide-react'

const toolColorSchemeGeneratorManifest = defineToolManifest({
  id: 'tool-color-scheme-generator',
  path: '/color-scheme-generator',
  namespace: 'toolColorSchemeGenerator',
  mode: 'client',
  categoryKey: 'utils',
  icon: Paintbrush,
  keywords: ['color', 'scheme', 'palette', 'harmony', '配色', '色彩', '方案'],
  meta: {
    zh: {
      title: '配色方案生成器',
      description: '自动生成和谐的配色方案，支持多种配色规则',
    },
    en: {
      title: 'Color Scheme Generator',
      description: 'Automatically generate harmonious color schemes with multiple color rules',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolColorSchemeGeneratorManifest
