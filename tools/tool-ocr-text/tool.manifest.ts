import { defineToolManifest } from '@toolbox/tool-registry'
import { ScanText } from 'lucide-react'

const toolOcrTextManifest = defineToolManifest({
  id: 'tool-ocr-text',
  path: '/ocr-text',
  namespace: 'toolOcrText',
  mode: 'client',
  categoryKey: 'utils',
  icon: ScanText,
  keywords: ['ocr', 'text', 'recognition', '文字识别', '图片识别', '提取文字'],
  meta: {
    zh: {
      title: 'OCR 文字识别',
      description: '从图片中提取文字，支持中英文识别',
    },
    en: {
      title: 'OCR Text Recognition',
      description: 'Extract text from images, supports Chinese and English',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolOcrTextManifest
