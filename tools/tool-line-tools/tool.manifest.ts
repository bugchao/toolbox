import { defineToolManifest } from '@toolbox/tool-registry'
import { ListOrdered } from 'lucide-react'

const toolLineToolsManifest = defineToolManifest({
  id: 'tool-line-tools',
  path: '/line-tools',
  namespace: 'toolLineTools',
  mode: 'client',
  categoryKey: 'dev',
  icon: ListOrdered,
  keywords: [
    'lines',
    'sort',
    'dedupe',
    'unique',
    'reverse',
    'shuffle',
    'number',
    'filter',
    '文本',
    '行',
    '排序',
    '去重',
  ],
  meta: {
    zh: {
      title: '文本行处理',
      description: '按行处理文本：排序（升降/自然/长度）、去重、反转、打乱、加/去行号、去空行、trim、关键词过滤、统计。纯本地零依赖。',
    },
    en: {
      title: 'Line Tools',
      description: 'Process text line by line: sort (asc/desc/natural/length), dedupe, reverse, shuffle, (un)number, remove blanks, trim, filter, and stats. Fully local, zero deps.',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolLineToolsManifest
