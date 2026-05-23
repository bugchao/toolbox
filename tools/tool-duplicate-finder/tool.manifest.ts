import { defineToolManifest } from '@toolbox/tool-registry'
import { Copy } from 'lucide-react'

const toolDuplicateFinderManifest = defineToolManifest({
  id: 'tool-duplicate-finder',
  path: '/duplicate-finder',
  namespace: 'toolDuplicateFinder',
  mode: 'client',
  categoryKey: 'utility',
  icon: Copy,
  keywords: ['重复', '查重', '去重', 'duplicate', 'dedup', 'hash', 'sha-256'],
  meta: {
    zh: {
      title: '重复文件检测',
      description: '选多个文件，本地 SHA-256 哈希按内容分组找出重复；标记保留 / 删除并导出清理报告',
    },
    en: {
      title: 'Duplicate Finder',
      description: 'Select multiple files, hash with local SHA-256, group identical content; mark keep / delete and export a cleanup report',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolDuplicateFinderManifest
