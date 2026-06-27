import { defineToolManifest } from '@toolbox/tool-registry'
import { Wifi } from 'lucide-react'

const toolWifiQrManifest = defineToolManifest({
  id: 'tool-wifi-qr',
  path: '/wifi-qr',
  namespace: 'toolWifiQr',
  mode: 'client',
  categoryKey: 'utility',
  icon: Wifi,
  keywords: [
    'wifi',
    '二维码',
    'qrcode',
    '联网',
    'wifi 二维码',
    '分享 wifi',
    'share wifi',
    'WPA',
    'WEP',
    'SSID',
    '网络',
    'qr',
  ],
  meta: {
    zh: {
      title: 'WiFi 二维码',
      description: '输入网络信息生成可扫码联网的 WiFi 二维码，纯本地生成。',
    },
    en: {
      title: 'WiFi QR Code',
      description: 'Generate a scannable WiFi QR code from network details, fully local.',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolWifiQrManifest
