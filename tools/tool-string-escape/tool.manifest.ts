import { defineToolManifest } from '@toolbox/tool-registry'
import { Quote } from 'lucide-react'

const toolStringEscapeManifest = defineToolManifest({
  id: 'tool-string-escape',
  path: '/string-escape',
  namespace: 'toolStringEscape',
  mode: 'client',
  categoryKey: 'dev',
  icon: Quote,
  keywords: [
    'escape',
    'unescape',
    'string',
    'json',
    'javascript',
    'shell',
    'sql',
    'regex',
    '转义',
    '反转义',
    '字符串',
  ],
  meta: {
    zh: {
      title: '字符串转义',
      description: '在 JSON / JS / C / Shell / SQL / 正则 等语境下转义与反转义字符串；支持 \\xHH \\uHHHH \\u{} 八进制，双向实时。',
    },
    en: {
      title: 'String Escape',
      description: 'Escape and unescape strings for JSON / JS / C / Shell / SQL / regex contexts; handles \\xHH \\uHHHH \\u{} and octal, both directions live.',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolStringEscapeManifest
