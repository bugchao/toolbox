import { defineToolManifest } from '@toolbox/tool-registry'
import { Table } from 'lucide-react'

const toolCsvMarkdownManifest = defineToolManifest({
  id: 'tool-csv-markdown',
  path: '/csv-markdown',
  namespace: 'toolCsvMarkdown',
  mode: 'client',
  categoryKey: 'dev',
  icon: Table,
  keywords: [
    'csv',
    'markdown',
    'table',
    'convert',
    'transpose',
    'align',
    '表格',
    '转换',
    '互转',
    '对齐',
    '转置',
  ],
  meta: {
    zh: {
      title: 'CSV ↔ Markdown 表格',
      description: '双向实时互转 CSV 与 Markdown 表格：引号/换行字段、列对齐（左/中/右）、列宽美化（中英混排对齐）、转置。零依赖纯本地。',
    },
    en: {
      title: 'CSV ↔ Markdown Table',
      description: 'Bi-directional live conversion between CSV and Markdown tables: quoted/multiline fields, column alignment, pretty padding (CJK-aware) and transpose. Zero deps, fully local.',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolCsvMarkdownManifest
