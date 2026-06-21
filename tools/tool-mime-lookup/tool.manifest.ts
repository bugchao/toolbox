import { defineToolManifest } from '@toolbox/tool-registry'
import { FileType2 } from 'lucide-react'

const toolMimeLookupManifest = defineToolManifest({
  id: 'tool-mime-lookup',
  path: '/mime-lookup',
  namespace: 'toolMimeLookup',
  mode: 'client',
  categoryKey: 'dev',
  icon: FileType2,
  keywords: [
    'mime',
    'content-type',
    'extension',
    'media type',
    'lookup',
    'mime类型',
    '扩展名',
    '内容类型',
    '速查',
  ],
  meta: {
    zh: {
      title: 'MIME 类型速查',
      description: '扩展名 ↔ Content-Type 双向查询：输文件名/扩展名查 MIME，输 MIME 查扩展名，按类别搜索。离线速查。',
    },
    en: {
      title: 'MIME Type Lookup',
      description: 'Bi-directional extension ↔ Content-Type lookup: filename/extension → MIME, MIME → extensions, with category search. Offline reference.',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolMimeLookupManifest
