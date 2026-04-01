import { Send } from 'lucide-react'
import { defineToolManifest } from '@toolbox/tool-registry'

const toolPostmanLiteManifest = defineToolManifest({
  id: 'tool-postman-lite',
  path: '/postman-lite',
  namespace: 'toolPostmanLite',
  mode: 'client',
  categoryKey: 'dev',
  icon: Send,
  keywords: ['http', 'api', 'request', 'postman'],
  meta: {
    zh: {
      title: 'Postman Lite',
      description: '快速发送 HTTP 请求并查看响应、耗时和历史记录',
    },
    en: {
      title: 'Postman Lite',
      description: 'Send HTTP requests quickly and inspect responses, timings, and history',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolPostmanLiteManifest
