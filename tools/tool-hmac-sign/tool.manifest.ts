import { defineToolManifest } from '@toolbox/tool-registry'
import { FileSignature } from 'lucide-react'

const toolHmacSignManifest = defineToolManifest({
  id: 'tool-hmac-sign',
  path: '/hmac-sign',
  namespace: 'toolHmacSign',
  mode: 'client',
  categoryKey: 'dev',
  icon: FileSignature,
  keywords: ['hmac', '签名', 'sign', 'verify', 'sha256', 'webhook', 'api'],
  meta: {
    zh: {
      title: 'HMAC 签名',
      description: 'Web Crypto 原生 HMAC-SHA1/256/384/512 签名与验证：本地计算、Base64/Hex 输出、常量时间比对',
    },
    en: {
      title: 'HMAC',
      description: 'Native Web Crypto HMAC-SHA1/256/384/512 sign & verify, Base64/Hex output, constant-time compare',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolHmacSignManifest
