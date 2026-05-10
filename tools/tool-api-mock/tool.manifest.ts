import { defineToolManifest } from '@toolbox/tool-registry'
import { Webhook } from 'lucide-react'

const toolApiMockManifest = defineToolManifest({
  id: 'tool-api-mock',
  path: '/api-mock',
  namespace: 'toolApiMock',
  mode: 'client',
  categoryKey: 'dev',
  icon: Webhook,
  keywords: ['api', 'mock', 'response', 'rest', 'template', 'curl', '模拟', '响应', '接口'],
  meta: {
    zh: {
      title: 'API 响应模拟器',
      description: 'REST 响应模板库 + 状态码/延迟/headers 配置，生成本地 Mock URL 与 curl 命令',
    },
    en: {
      title: 'API Response Mock',
      description: 'REST response template gallery with status code, delay, and headers config; generates local mock URLs and curl commands',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolApiMockManifest
