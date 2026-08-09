import { defineToolManifest } from '@toolbox/tool-registry'
import { ShieldCheck } from 'lucide-react'

const toolDohConfigManifest = defineToolManifest({
  id: 'tool-doh-config',
  path: '/doh-config',
  namespace: 'toolDohConfig',
  mode: 'client',
  categoryKey: 'network',
  icon: ShieldCheck,
  keywords: ['doh', 'dns-over-https', 'doh-config', '配置', '延迟测试', 'firefox', 'chrome', 'windows', 'linux'],
  meta: {
    zh: {
      title: 'DoH 配置助手',
      description: '常用 DoH 提供商列表、连通性/延迟测试，Firefox/Chrome-Edge/Windows/Linux 一键复制配置片段',
    },
    en: {
      title: 'DoH Config Assistant',
      description: 'Common DoH providers, connectivity/latency test, copyable config snippets for Firefox/Chrome-Edge/Windows/Linux',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolDohConfigManifest
