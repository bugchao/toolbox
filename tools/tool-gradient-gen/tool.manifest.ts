import { defineToolManifest } from '@toolbox/tool-registry'

const toolGradientGenManifest = defineToolManifest({
  id: 'tool-gradient-gen',
  path: '/gradient-gen',
  namespace: 'toolGradientGen',
  mode: 'client',
  meta: {
    zh: {
      title: '渐变色生成器',
      description: '生成漂亮的CSS渐变色，支持多种渐变模式和颜色调整',
    },
    en: {
      title: 'Gradient Generator',
      description: 'Generate beautiful CSS gradients with multiple modes and color adjustments',
    },
  },
  loadComponent: () => import('./src/GradientGen'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolGradientGenManifest
