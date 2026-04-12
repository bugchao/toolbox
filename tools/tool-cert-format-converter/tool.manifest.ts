import { defineToolManifest } from '@toolbox/tool-registry'
import { RefreshCw } from 'lucide-react'

const toolCertFormatConverterManifest = defineToolManifest({
  id: 'tool-cert-format-converter',
  path: '/ssl-format-converter',
  namespace: 'toolCertFormatConverter',
  mode: 'server',
  categoryKey: 'network',
  icon: RefreshCw,
  keywords: ['pfx', 'jks', 'pem', 'pkcs8', 'openssl', 'keytool', '证书转换'],
  meta: {
    zh: {
      title: 'SSL 证书格式转换',
      description: '支持 PFX、JKS、PEM、PKCS8 之间的证书与私钥转换，并输出可下载结果。',
    },
    en: {
      title: 'SSL Format Converter',
      description: 'Convert certificate bundles and keys across PFX, JKS, PEM, and PKCS8 with downloadable outputs.',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolCertFormatConverterManifest
