import { defineToolManifest } from '@toolbox/tool-registry'
import { ShieldCheck } from 'lucide-react'

const toolCertContentViewerManifest = defineToolManifest({
  id: 'tool-cert-content-viewer',
  path: '/cert-content-viewer',
  namespace: 'toolCertContentViewer',
  mode: 'server',
  categoryKey: 'network',
  icon: ShieldCheck,
  keywords: ['certificate', 'x509', 'pem', 'der', '证书', 'fingerprint'],
  meta: {
    zh: {
      title: '查看证书内容',
      description: '查看 X.509 证书的主题、颁发者、有效期、指纹、SAN 和 OpenSSL 详情。',
    },
    en: {
      title: 'Certificate Viewer',
      description: 'Inspect subject, issuer, validity, fingerprint, SANs, and OpenSSL details from an X.509 certificate.',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolCertContentViewerManifest
