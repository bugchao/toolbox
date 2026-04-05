import { defineToolManifest } from '@toolbox/tool-registry'
import { Layers } from 'lucide-react'

const toolImageCanvasLabManifest = defineToolManifest({
  id: 'tool-image-canvas-lab',
  path: '/image-canvas-lab',
  namespace: 'toolImageCanvasLab',
  mode: 'client',
  categoryKey: 'utils',
  icon: Layers,
  keywords: ['canvas', 'image', 'layer', 'watermark', 'Canvas', '图像合成', '多图层', '水印添加'],
  meta: {
    zh: {
      title: 'Canvas 图像工作台',
      description: '多图层合成、水印添加、像素级处理',
    },
    en: {
      title: 'Image Canvas Lab',
      description: 'Multi-layer composition, watermark addition, pixel-level processing',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolImageCanvasLabManifest
