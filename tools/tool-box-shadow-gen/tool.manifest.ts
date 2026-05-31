import { defineToolManifest } from '@toolbox/tool-registry'
import { BoxSelect } from 'lucide-react'

const toolBoxShadowGenManifest = defineToolManifest({
  id: 'tool-box-shadow-gen',
  path: '/box-shadow-gen',
  namespace: 'toolBoxShadowGen',
  mode: 'client',
  categoryKey: 'utility',
  icon: BoxSelect,
  keywords: [
    'box-shadow',
    'css',
    'tailwind',
    'shadow',
    'neumorphism',
    'glassmorphism',
    'material',
    '阴影',
    '投影',
    '样式',
    '生成器',
    '预览',
  ],
  meta: {
    zh: {
      title: 'CSS 阴影生成器',
      description: '多层 box-shadow 可视化编辑：拖动参数实时预览，内置 Material / Neumorphism 等预设，一键复制 CSS 或 Tailwind。',
    },
    en: {
      title: 'CSS Box Shadow Generator',
      description: 'Stack multiple box-shadow layers with live preview, Material / Neumorphism presets, and one-click CSS or Tailwind output.',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolBoxShadowGenManifest
