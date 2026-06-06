import { defineToolManifest } from '@toolbox/tool-registry'
import { Link2 } from 'lucide-react'

const toolUrlQueryManifest = defineToolManifest({
  id: 'tool-url-query',
  path: '/url-query',
  namespace: 'toolUrlQuery',
  mode: 'client',
  categoryKey: 'dev',
  icon: Link2,
  keywords: [
    'url',
    'query',
    'querystring',
    'params',
    'parameters',
    'encode',
    'decode',
    'url 编辑',
    '查询参数',
    '编解码',
  ],
  meta: {
    zh: {
      title: 'URL Query 可视化编辑',
      description: '把 URL 的查询参数拆成可编辑列表，编辑后实时拼回完整 URL，支持编解码、重复键和空值键。',
    },
    en: {
      title: 'URL Query Editor',
      description: 'Visualize a URL: split its query into an editable list and rebuild the full URL live, with encode/decode, duplicates and bare keys.',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolUrlQueryManifest
