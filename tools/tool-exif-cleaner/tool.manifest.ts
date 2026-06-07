import { defineToolManifest } from '@toolbox/tool-registry'
import { ShieldCheck } from 'lucide-react'

const toolExifCleanerManifest = defineToolManifest({
  id: 'tool-exif-cleaner',
  path: '/exif-cleaner',
  namespace: 'toolExifCleaner',
  mode: 'client',
  categoryKey: 'utility',
  icon: ShieldCheck,
  keywords: [
    'exif',
    'metadata',
    'privacy',
    'gps',
    'strip',
    'cleaner',
    'photo',
    'image',
    '元数据',
    '隐私',
    '相机',
    '位置',
    '清除',
  ],
  meta: {
    zh: {
      title: 'EXIF 清理器',
      description: '本地解析照片 EXIF 元数据（相机/时间/GPS 等），一键剥离全部元数据并下载干净副本，零上传、隐私安全。',
    },
    en: {
      title: 'EXIF Cleaner',
      description: 'Parse photo EXIF metadata (camera / time / GPS) locally and strip everything with one click. Download a clean copy, fully in-browser with zero uploads.',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolExifCleanerManifest
