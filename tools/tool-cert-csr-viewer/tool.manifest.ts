import { defineToolManifest } from '@toolbox/tool-registry'
import { FileSearch } from 'lucide-react'

const toolCertCsrViewerManifest = defineToolManifest({
  id: 'tool-cert-csr-viewer',
  path: '/cert-csr-viewer',
  namespace: 'toolCertCsrViewer',
  mode: 'server',
  categoryKey: 'network',
  icon: FileSearch,
  keywords: ['csr', 'openssl', 'certificate request', '证书请求', 'SAN'],
  meta: {
    zh: {
      title: '查看证书 CSR',
      description: '解析证书签名请求中的主体、SAN、签名算法和公钥信息，适合发证前核对。',
    },
    en: {
      title: 'CSR Viewer',
      description: 'Inspect subject, SAN, signature algorithm, and public-key details from a certificate signing request.',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolCertCsrViewerManifest
