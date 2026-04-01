import { Lock } from 'lucide-react'
import { defineToolManifest } from '@toolbox/tool-registry'

const toolTextCipherManifest = defineToolManifest({
  id: 'tool-text-cipher',
  path: '/text-cipher',
  namespace: 'toolTextCipher',
  mode: 'client',
  categoryKey: 'dev',
  icon: Lock,
  keywords: ['cipher', 'encrypt', 'decrypt', 'base64', 'rot13'],
  meta: {
    zh: {
      title: '文本加密解密',
      description: '支持 Base64、ROT13 和 Caesar 位移的快速文本转换',
    },
    en: {
      title: 'Text Cipher',
      description: 'Quick text transforms with Base64, ROT13, and Caesar shift',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolTextCipherManifest
