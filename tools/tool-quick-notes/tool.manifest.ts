import { defineToolManifest } from '@toolbox/tool-registry'
import { StickyNote } from 'lucide-react'

const toolQuickNotesManifest = defineToolManifest({
  id: 'tool-quick-notes',
  path: '/quick-notes',
  namespace: 'toolQuickNotes',
  mode: 'client',
  categoryKey: 'life',
  icon: StickyNote,
  keywords: ['notes', 'quick', 'memo', '笔记', '速记', '便签'],
  meta: {
    zh: {
      title: '快速笔记',
      description: '简洁高效的笔记工具，支持本地存储和导入导出',
    },
    en: {
      title: 'Quick Notes',
      description: 'Simple and efficient note-taking tool with local storage and import/export',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolQuickNotesManifest
