import { defineToolManifest } from '@toolbox/tool-registry'
import { FilePlus2 } from 'lucide-react'

const toolImageToPdfManifest = defineToolManifest({
  id: 'tool-image-to-pdf',
  path: '/image-to-pdf',
  namespace: 'toolImageToPdf',
  mode: 'client',
  categoryKey: 'utility',
  icon: FilePlus2,
  keywords: [
    'image',
    'pdf',
    'image-to-pdf',
    'jpg-to-pdf',
    'png-to-pdf',
    '图片转pdf',
    '图转pdf',
    '合成pdf',
    '扫描',
    'scan',
    'combine',
    'merge',
  ],
  meta: {
    zh: {
      title: '图片转 PDF',
      description: '本地把多张 JPG/PNG/WebP 图片合成为一个 PDF：拖拽排序、旋转、A4/Letter 等纸张、横竖、边距、每页 1/2/4 张拼版，导出不上传。',
    },
    en: {
      title: 'Images → PDF',
      description: 'Combine multiple JPG / PNG / WebP images into a single PDF locally: drag to reorder, rotate, paper size, orientation, margins, 1/2/4-per-page layout — no upload.',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolImageToPdfManifest
