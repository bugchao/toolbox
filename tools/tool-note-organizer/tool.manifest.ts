import { defineToolManifest } from '@toolbox/tool-registry'
import { NotebookTabs } from 'lucide-react'

const toolNoteOrganizerManifest = defineToolManifest({
  id: 'tool-note-organizer',
  path: '/note-organizer',
  namespace: 'toolNoteOrganizer',
  mode: 'client',
  categoryKey: 'learn',
  icon: NotebookTabs,
  keywords: ['note', 'organizer', '整理', '学习', '笔记'],
  meta: {
    zh: {
      title: '笔记整理助手',
      description: '把原始笔记自动拆成任务、问题和洞察三类',
    },
    en: {
      title: 'Note Organizer',
      description: 'Split raw notes into tasks, open questions, and useful insights',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolNoteOrganizerManifest
