import { defineToolManifest } from '@toolbox/tool-registry'
import { Tags } from 'lucide-react'

const toolMetaTagsManifest = defineToolManifest({
  id: 'tool-meta-tags',
  path: '/meta-tags',
  namespace: 'toolMetaTags',
  mode: 'client',
  categoryKey: 'dev',
  icon: Tags,
  keywords: [
    'meta tags',
    'open graph',
    'og',
    'twitter card',
    'SEO',
    'canonical',
    'social preview',
    '元标签',
    '社交分享',
    '分享预览',
    '搜索优化',
  ],
  meta: {
    zh: {
      title: 'Meta 标签生成器',
      description: '生成 SEO、Open Graph 与 Twitter Card 标签并实时预览分享卡片',
    },
    en: {
      title: 'Meta Tag Generator',
      description: 'Generate SEO, Open Graph & Twitter Card tags with live preview',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolMetaTagsManifest
