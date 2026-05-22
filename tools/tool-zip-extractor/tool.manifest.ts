import { defineToolManifest } from '@toolbox/tool-registry'
import { FolderArchive } from 'lucide-react'

const toolZipExtractorManifest = defineToolManifest({
  id: 'tool-zip-extractor',
  path: '/zip-extractor',
  namespace: 'toolZipExtractor',
  mode: 'client',
  categoryKey: 'utility',
  icon: FolderArchive,
  keywords: ['zip', '解压', '压缩包', '文件树', 'extract', 'archive'],
  meta: {
    zh: {
      title: 'ZIP 在线解压',
      description: '拖入 ZIP 浏览文件树，单文件下载或文本/图片预览；本地处理，不上传',
    },
    en: {
      title: 'ZIP Extractor',
      description: 'Drag in a ZIP to browse its tree, download or preview text / images; all local, no upload',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolZipExtractorManifest
