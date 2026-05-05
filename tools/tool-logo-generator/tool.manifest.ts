import { defineToolManifest } from '@toolbox/tool-registry'
import { Palette } from 'lucide-react'

const toolLogoGeneratorManifest = defineToolManifest({
  id: 'tool-logo-generator',
  path: '/logo-generator',
  namespace: 'toolLogoGenerator',
  mode: 'client',
  categoryKey: 'utils',
  icon: Palette,
  keywords: ['logo', 'generator', 'design', 'brand', 'ai'],
  meta: {
    zh: {
      title: 'Logo 生成器',
      description: 'AI 生成品牌 Logo，支持多种风格和颜色方案',
    },
    en: {
      title: 'Logo Generator',
      description: 'AI-powered logo generation with multiple styles and color schemes',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolLogoGeneratorManifest
