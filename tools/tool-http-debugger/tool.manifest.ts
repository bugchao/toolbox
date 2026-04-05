import { defineToolManifest } from '@toolbox/tool-registry'
import { Network } from 'lucide-react'

const toolHttpDebuggerManifest = defineToolManifest({
  id: 'tool-http-debugger',
  path: '/http-debugger',
  namespace: 'toolHttpDebugger',
  mode: 'client',
  categoryKey: 'dev',
  icon: Network,
  keywords: ['HTTP', 'debugger', 'API', 'testing', 'HTTP调试', 'API测试', '请求调试', '接口测试'],
  meta: {
    zh: {
      title: 'HTTP 请求调试器',
      description: '在线发送 HTTP 请求，调试 API 接口',
    },
    en: {
      title: 'HTTP Request Debugger',
      description: 'Send HTTP requests online and debug API endpoints',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolHttpDebuggerManifest
