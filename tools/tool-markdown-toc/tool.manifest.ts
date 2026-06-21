import { defineToolManifest } from '@toolbox/tool-registry'
import { ListTree } from 'lucide-react'

const toolMarkdownTocManifest = defineToolManifest({
  id: 'tool-markdown-toc',
  path: '/markdown-toc',
  namespace: 'toolMarkdownToc',
  mode: 'client',
  categoryKey: 'dev',
  icon: ListTree,
  keywords: [
    'markdown',
    'toc',
    'table of contents',
    'heading',
    'anchor',
    'outline',
    '目录',
    '标题',
    '锚点',
    '大纲',
  ],
  meta: {
    zh: {
      title: 'Markdown 目录生成',
      description: '从 Markdown 标题生成嵌套目录（TOC）：GitHub 风格锚点、可调层级范围、有序/无序、跳过代码块、同名锚点去重。纯本地。',
    },
    en: {
      title: 'Markdown TOC',
      description: 'Generate a nested table of contents from Markdown headings: GitHub-style anchors, level range, ordered/unordered, code-block aware, slug de-dup. Fully local.',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolMarkdownTocManifest
