import { defineToolManifest } from '@toolbox/tool-registry'
import { SplitSquareHorizontal } from 'lucide-react'

const toolFileSplitterManifest = defineToolManifest({
  id: 'tool-file-splitter',
  path: '/file-splitter',
  namespace: 'toolFileSplitter',
  mode: 'client',
  categoryKey: 'utility',
  icon: SplitSquareHorizontal,
  keywords: ['文件', '分割', '合并', '切片', 'split', 'merge', 'chunk'],
  meta: {
    zh: {
      title: '大文件分割合并',
      description: '按字节数或份数切分文件为多个 .part，反向多选 part 合并恢复；浏览器本地处理',
    },
    en: {
      title: 'File Splitter / Merger',
      description: 'Split a file by byte size or part count into .part fragments; merge multiple parts back. All in-browser',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolFileSplitterManifest
