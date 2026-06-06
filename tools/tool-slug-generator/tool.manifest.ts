import { defineToolManifest } from '@toolbox/tool-registry'
import { Link2 } from 'lucide-react'

const toolSlugGeneratorManifest = defineToolManifest({
  id: 'tool-slug-generator',
  path: '/slug-generator',
  namespace: 'toolSlugGenerator',
  mode: 'client',
  categoryKey: 'dev',
  icon: Link2,
  keywords: [
    'slug',
    'url',
    'kebab',
    'pinyin',
    'normalize',
    'unicode',
    'permalink',
    '别名',
    '链接',
    '拼音',
    '规范化',
    '别名生成',
  ],
  meta: {
    zh: {
      title: 'Slug 生成器',
      description: '把任意文本转 URL 友好的别名：中文拼音、英文 kebab-case、Unicode 规范化、停用词剔除、自定义替换、批量模式。',
    },
    en: {
      title: 'Slug Generator',
      description: 'Turn any text into a URL-friendly slug: pinyin for Chinese, kebab-case for English, Unicode normalization, stopword stripping, custom replacements, and batch mode.',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolSlugGeneratorManifest
