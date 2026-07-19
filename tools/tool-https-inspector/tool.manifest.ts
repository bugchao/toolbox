import { defineToolManifest } from '@toolbox/tool-registry'
import { ShieldCheck } from 'lucide-react'

const toolHttpsInspectorManifest = defineToolManifest({
  id: 'tool-https-inspector',
  path: '/https-inspector',
  namespace: 'toolHttpsInspector',
  mode: 'server',
  categoryKey: 'network',
  icon: ShieldCheck,
  keywords: ['https', 'ssl', 'tls', '评级', 'ipv6', 'cdn', '国密', 'gmssl', '后量子', 'pqc', '邮件服务器', 'inspector'],
  meta: {
    zh: {
      title: '全方位 HTTPS 检测',
      description: '一次检测站点的 HTTPS 评级、IPv6、CDN、邮件服务器、国密与后量子支持',
    },
    en: {
      title: 'HTTPS Inspector',
      description: 'All-in-one site check: HTTPS grade, IPv6, CDN, mail server, GM & post-quantum TLS',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolHttpsInspectorManifest
