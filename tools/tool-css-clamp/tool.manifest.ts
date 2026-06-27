import { defineToolManifest } from '@toolbox/tool-registry'
import { MoveHorizontal } from 'lucide-react'

const toolCssClampManifest = defineToolManifest({
  id: 'tool-css-clamp',
  path: '/css-clamp',
  namespace: 'toolCssClamp',
  mode: 'client',
  categoryKey: 'dev',
  icon: MoveHorizontal,
  keywords: [
    'css clamp',
    'clamp 生成',
    '流式排版',
    'fluid typography',
    '响应式',
    '响应式字号',
    'viewport',
    'vw',
    'rem',
    '间距',
    'responsive',
  ],
  meta: {
    zh: {
      title: 'CSS clamp() 生成器',
      description: '生成流式响应式字号与间距的 clamp() 表达式，并实时预览不同视口取值',
    },
    en: {
      title: 'CSS clamp() Generator',
      description: 'Generate fluid clamp() expressions for responsive font sizes and spacing.',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolCssClampManifest
