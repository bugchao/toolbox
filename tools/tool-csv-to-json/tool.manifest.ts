import { defineToolManifest } from '@toolbox/tool-registry'
import { FileSpreadsheet } from 'lucide-react'

const toolCsvToJsonManifest = defineToolManifest({
  id: 'tool-csv-to-json',
  path: '/csv-to-json',
  namespace: 'toolCsvToJson',
  mode: 'client',
  categoryKey: 'dev',
  icon: FileSpreadsheet,
  keywords: ['csv', 'json', 'convert', 'data', 'delimiter', '表格', '转换', '数据'],
  meta: {
    zh: {
      title: 'CSV 转 JSON',
      description: 'CSV 格式转换为 JSON，支持自定义分隔符和表头识别',
    },
    en: {
      title: 'CSV to JSON',
      description: 'Convert CSV to JSON with custom delimiter and header detection',
    },
  },
  loadComponent: () => import('./src/CsvToJson'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolCsvToJsonManifest
