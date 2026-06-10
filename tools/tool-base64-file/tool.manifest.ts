import { defineToolManifest } from '@toolbox/tool-registry'
import { FileDigit } from 'lucide-react'

const toolBase64FileManifest = defineToolManifest({
  id: 'tool-base64-file',
  path: '/base64-file',
  namespace: 'toolBase64File',
  mode: 'client',
  categoryKey: 'dev',
  icon: FileDigit,
  keywords: [
    'base64',
    'file',
    'data uri',
    'encode',
    'decode',
    'binary',
    'download',
    '文件',
    '编码',
    '解码',
    '转换',
  ],
  meta: {
    zh: {
      title: 'Base64 文件互转',
      description: '拖文件转 Base64 / Data URI；粘 Base64 自动嗅探文件类型（PNG/JPEG/PDF/ZIP 等魔数）并还原下载。纯本地处理。',
    },
    en: {
      title: 'Base64 ↔ File',
      description: 'Drop a file to get Base64 / Data URI; paste Base64 to sniff the type (PNG/JPEG/PDF/ZIP magic bytes) and download the restored file. Fully local.',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolBase64FileManifest
