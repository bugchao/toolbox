import { defineToolManifest } from '@toolbox/tool-registry'
import { Maximize2 } from 'lucide-react'

const toolImageKbResizerManifest = defineToolManifest({
  id: 'tool-image-kb-resizer',
  path: '/image-kb-resizer',
  namespace: 'toolImageKbResizer',
  mode: 'client',
  categoryKey: 'utility',
  icon: Maximize2,
  keywords: ['图片', '压缩', '文件大小', 'kb', 'resize', 'compress', 'image size'],
  meta: {
    zh: {
      title: '图片文件大小调整',
      description: '把图片精确调整到目标 KB 大小——可增大也可压缩',
    },
    en: {
      title: 'Image KB Resizer',
      description: 'Resize an image to an exact target file size in KB — increase or compress',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolImageKbResizerManifest
