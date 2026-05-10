import { defineToolManifest } from '@toolbox/tool-registry'
import { Database } from 'lucide-react'

const toolSqlFormatterManifest = defineToolManifest({
  id: 'tool-sql-formatter',
  path: '/sql-formatter',
  namespace: 'toolSqlFormatter',
  mode: 'client',
  categoryKey: 'dev',
  icon: Database,
  keywords: ['sql', 'format', 'beautify', 'mysql', 'postgresql', '格式化', 'SQL'],
  meta: {
    zh: {
      title: 'SQL 格式化工具',
      description: 'SQL 代码格式化和美化，支持多种 SQL 方言',
    },
    en: {
      title: 'SQL Formatter',
      description: 'Format and beautify SQL code with support for multiple SQL dialects',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolSqlFormatterManifest
