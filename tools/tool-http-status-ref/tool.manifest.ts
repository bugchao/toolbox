import { defineToolManifest } from '@toolbox/tool-registry'
import { ListChecks } from 'lucide-react'

const toolHttpStatusRefManifest = defineToolManifest({
  id: 'tool-http-status-ref',
  path: '/http-status-ref',
  namespace: 'toolHttpStatusRef',
  mode: 'client',
  categoryKey: 'dev',
  icon: ListChecks,
  keywords: [
    'http',
    'status code',
    'reference',
    '404',
    '500',
    '301',
    'cheatsheet',
    '状态码',
    '速查',
    '参考',
  ],
  meta: {
    zh: {
      title: 'HTTP 状态码速查',
      description: '常用 HTTP 状态码速查参考：按 1xx–5xx 分类、按码或含义搜索，含中文释义与常见场景。纯离线参考。',
    },
    en: {
      title: 'HTTP Status Codes',
      description: 'Quick reference for HTTP status codes: grouped by 1xx–5xx, searchable by code or meaning, with explanations and common scenarios. Offline reference.',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolHttpStatusRefManifest
