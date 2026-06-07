import { defineToolManifest } from '@toolbox/tool-registry'
import { Cookie } from 'lucide-react'

const toolCookieParserManifest = defineToolManifest({
  id: 'tool-cookie-parser',
  path: '/cookie-parser',
  namespace: 'toolCookieParser',
  mode: 'client',
  categoryKey: 'dev',
  icon: Cookie,
  keywords: [
    'cookie',
    'set-cookie',
    'parser',
    'http',
    'header',
    'security',
    'privacy',
    'samesite',
    'httponly',
    'secure',
    'session',
    '解析',
    '请求头',
    '响应头',
  ],
  meta: {
    zh: {
      title: 'Cookie 解析',
      description: '粘贴 Cookie 请求头或 Set-Cookie 响应头，本地解析为结构化表格，并标注 SameSite/Secure/HttpOnly 等安全与隐私问题。',
    },
    en: {
      title: 'Cookie Parser',
      description: 'Paste Cookie request headers or Set-Cookie response headers; parse locally into structured tables and flag SameSite/Secure/HttpOnly security and privacy issues.',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolCookieParserManifest
