import { defineToolManifest } from '@toolbox/tool-registry'
import { Router } from 'lucide-react'

const toolLocalIpManifest = defineToolManifest({
  id: 'tool-local-ip',
  path: '/local-ip',
  namespace: 'toolLocalIp',
  mode: 'hybrid',
  categoryKey: 'ip',
  icon: Router,
  keywords: ['local-ip', '本机 ip', '局域网 ip', 'lan ip', 'webrtc', '公网 ip', 'public ip', 'stun', '内网 ip'],
  meta: {
    zh: {
      title: '本机 IP 查询',
      description: '通过 WebRTC STUN 探测局域网 IP，并查询当前公网出口 IP',
    },
    en: {
      title: 'Local IP Finder',
      description: 'Detect LAN IP via WebRTC STUN and look up your public egress IP',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolLocalIpManifest
