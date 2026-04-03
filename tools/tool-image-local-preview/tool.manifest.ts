import { defineToolManifest } from '@toolbox/tool-registry'
import { ImagePlus } from 'lucide-react'

const toolImageLocalPreviewManifest = defineToolManifest({
  id: 'tool-image-local-preview',
  path: '/image-local-preview',
  namespace: 'toolImageLocalPreview',
  mode: 'client',
  categoryKey: 'utils',
  icon: ImagePlus,
  keywords: ['image', 'preview', 'local', '元信息', '预览'],
  meta: {
    zh: {
      title: '本地图像预览',
      description: '本地读取图片、查看预览和基础元信息，不上传文件',
    },
    en: {
      title: 'Image Local Preview',
      description: 'Preview local images and inspect lightweight metadata without uploading files',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolImageLocalPreviewManifest
