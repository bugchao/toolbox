import { defineToolManifest } from '@toolbox/tool-registry'

const toolDocMergerManifest = defineToolManifest({
  id: 'tool-doc-merger',
  path: '/doc-merger',
  namespace: 'toolDocMerger',
  mode: 'client',
  meta: {
    zh: {
      title: '文档合并工具',
      description: '合并多个 PDF 文档为一个文件，支持拖拽排序',
    },
    en: {
      title: 'Document Merger',
      description: 'Merge multiple PDF documents into one file with drag-and-drop sorting',
    },
  },
  loadComponent: () => import('./src/DocMerger'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolDocMergerManifest
