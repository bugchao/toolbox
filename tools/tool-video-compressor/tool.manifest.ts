import { defineToolManifest } from '@toolbox/tool-registry'
import { Video } from 'lucide-react'

const toolVideoCompressorManifest = defineToolManifest({
  id: 'tool-video-compressor',
  path: '/video-compressor',
  namespace: 'toolVideoCompressor',
  mode: 'client',
  categoryKey: 'utils',
  icon: Video,
  keywords: ['video', 'compressor', 'compression', 'media', 'mp4', 'webm', '视频', '压缩', '媒体'],
  meta: {
    zh: {
      title: '视频压缩',
      description: '在线视频压缩工具，支持多种视频格式，可自定义压缩质量和目标大小',
    },
    en: {
      title: 'Video Compressor',
      description: 'Online video compression tool with support for multiple formats and customizable quality',
    },
  },
  loadComponent: () => import('./src/VideoCompressor'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolVideoCompressorManifest
