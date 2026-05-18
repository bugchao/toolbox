import { defineToolManifest } from '@toolbox/tool-registry'
import { KeyRound } from 'lucide-react'

const toolAesCipherManifest = defineToolManifest({
  id: 'tool-aes-cipher',
  path: '/aes-cipher',
  namespace: 'toolAesCipher',
  mode: 'client',
  categoryKey: 'dev',
  icon: KeyRound,
  keywords: ['aes', '加密', '解密', 'gcm', 'cbc', 'ctr', 'crypto', 'pbkdf2'],
  meta: {
    zh: {
      title: 'AES 加解密',
      description: 'Web Crypto API 原生 AES-GCM / CBC / CTR；128/192/256 位密钥；PBKDF2 口令派生；随机 IV / Base64 / Hex 全支持',
    },
    en: {
      title: 'AES Cipher',
      description: 'Native Web Crypto AES-GCM / CBC / CTR; 128/192/256-bit keys; PBKDF2 passphrase derivation; random IV; Base64 / Hex I/O',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolAesCipherManifest
