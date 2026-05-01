import { defineToolManifest } from '@toolbox/tool-registry'
import { Palette } from 'lucide-react'

export default defineToolManifest({
  id: 'gradient-gen',
  path: '/gradient-gen',
  namespace: 'toolGradientGen',
  categoryKey: 'design',
  icon: Palette,
  keywords: ['gradient', 'color', 'css', 'design', '渐变', '颜色', '设计'],
  meta: {
    zh: {
      title: '渐变色生成器',
      description: '在线生成 CSS 渐变色，支持线性、径向、圆锥渐变'
    },
    en: {
      title: 'Gradient Generator',
      description: 'Generate CSS gradients online, supports linear, radial, and conic gradients'
    }
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./locales/zh-CN.json'),
    en: () => import('./locales/en-US.json')
  }
})
