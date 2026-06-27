import { defineToolManifest } from '@toolbox/tool-registry'
import { MonitorSmartphone } from 'lucide-react'

const toolUserAgentManifest = defineToolManifest({
  id: 'tool-user-agent',
  path: '/user-agent',
  namespace: 'toolUserAgent',
  mode: 'client',
  categoryKey: 'dev',
  icon: MonitorSmartphone,
  keywords: [
    'user agent',
    'user-agent',
    'useragent',
    'UA',
    'UA 解析',
    'user-agent 解析',
    '浏览器识别',
    '操作系统',
    '设备类型',
    '爬虫识别',
    'browser',
    'engine',
    'os',
    'bot',
    'device',
  ],
  meta: {
    zh: {
      title: 'User-Agent 解析器',
      description: '解析 UA 字符串，识别浏览器、引擎、系统、设备与爬虫',
    },
    en: {
      title: 'User-Agent Parser',
      description: 'Parse a UA string into browser, engine, OS, device and bot info',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolUserAgentManifest
