import { defineToolManifest } from '@toolbox/tool-registry'
import { Table } from 'lucide-react'

const toolMdTableGenManifest = defineToolManifest({
  id: 'tool-md-table-gen',
  path: '/md-table-gen',
  namespace: 'toolMdTableGen',
  mode: 'client',
  categoryKey: 'dev',
  icon: Table,
  keywords: ['markdown', '表格', 'table', 'csv', 'tsv', 'json', 'md'],
  meta: {
    zh: {
      title: 'Markdown 表格生成器',
      description: '可视化编辑 + CSV/TSV/JSON/Markdown 互转 + 列对齐 + 实时输出，本地处理',
    },
    en: {
      title: 'Markdown Table Generator',
      description: 'Visual editor + CSV/TSV/JSON/Markdown conversion + column alignment + live output, all local',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolMdTableGenManifest
