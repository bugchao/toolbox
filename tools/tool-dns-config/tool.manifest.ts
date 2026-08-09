import { defineToolManifest } from '@toolbox/tool-registry'
import { Server } from 'lucide-react'

const toolDnsConfigManifest = defineToolManifest({
  id: 'tool-dns-config',
  path: '/dns-config',
  namespace: 'toolDnsConfig',
  mode: 'client',
  categoryKey: 'network',
  icon: Server,
  keywords: ['dns', 'dns-config', '配置', '延迟测试', 'mac', 'linux', 'windows', 'DoH'],
  meta: {
    zh: {
      title: 'DNS 配置助手',
      description: '常用公共 DNS 列表、多 DNS 延迟测试，Mac/Linux/Windows 一键复制配置脚本',
    },
    en: {
      title: 'DNS Config Assistant',
      description: 'Common public DNS list, multi-DNS latency test, copyable config scripts for Mac/Linux/Windows',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolDnsConfigManifest
