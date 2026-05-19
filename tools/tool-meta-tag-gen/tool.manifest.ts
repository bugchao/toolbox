import { defineToolManifest } from '@toolbox/tool-registry'
import { Tags } from 'lucide-react'

const toolMetaTagGenManifest = defineToolManifest({
  id: 'tool-meta-tag-gen',
  path: '/meta-tag-gen',
  namespace: 'toolMetaTagGen',
  mode: 'client',
  categoryKey: 'utility',
  icon: Tags,
  keywords: ['seo', 'meta', 'og', 'open graph', 'twitter card', '社交卡片', '搜索优化'],
  meta: {
    zh: {
      title: 'Meta 标签生成器',
      description: '一键生成 SEO + Open Graph + Twitter Card 标签，实时预览 Google / Twitter / Facebook 分享卡片',
    },
    en: {
      title: 'Meta Tag Generator',
      description: 'Generate SEO + Open Graph + Twitter Card tags in one click, with live preview of Google / Twitter / Facebook share cards',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolMetaTagGenManifest
