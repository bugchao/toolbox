import { defineToolManifest } from '@toolbox/tool-registry'
import { ImageDown } from 'lucide-react'

const toolFaviconGeneratorManifest = defineToolManifest({
  id: 'tool-favicon-generator',
  path: '/favicon-generator',
  namespace: 'toolFaviconGenerator',
  mode: 'client',
  categoryKey: 'utility',
  icon: ImageDown,
  keywords: [
    'favicon',
    'ico',
    'icon',
    'png',
    'webmanifest',
    'apple-touch-icon',
    'maskable',
    '图标',
    '网站图标',
    '生成器',
  ],
  meta: {
    zh: {
      title: 'Favicon 生成器',
      description: '本地上传一张图片，一键生成多尺寸 favicon.ico、独立 PNG、site.webmanifest 与 HTML <link> 片段，并打包下载。',
    },
    en: {
      title: 'Favicon Generator',
      description: 'Upload an image locally and instantly generate a multi-size favicon.ico, standalone PNGs, site.webmanifest, HTML <link> snippets, and a ZIP bundle.',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolFaviconGeneratorManifest
