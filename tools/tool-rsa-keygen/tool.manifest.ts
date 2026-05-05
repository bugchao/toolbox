import { defineToolManifest } from '@toolbox/tool-registry'
import { KeyRound } from 'lucide-react'

const toolRsaKeygenManifest = defineToolManifest({
  id: 'tool-rsa-keygen',
  path: '/rsa-keygen',
  namespace: 'toolRsaKeygen',
  mode: 'client',
  categoryKey: 'dev',
  icon: KeyRound,
  keywords: ['rsa', 'key', 'keygen', 'public key', 'private key', '密钥', '公钥', '私钥', '加密'],
  meta: {
    zh: {
      title: 'RSA 密钥生成',
      description: '生成 RSA 公钥和私钥对，支持多种密钥长度和格式',
    },
    en: {
      title: 'RSA Key Generator',
      description: 'Generate RSA public and private key pairs with various key lengths and formats',
    },
  },
  loadComponent: () => import('./src/RsaKeygen'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolRsaKeygenManifest
