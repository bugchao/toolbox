import { defineToolManifest } from '@toolbox/tool-registry'
import { FileCheck2 } from 'lucide-react'

const toolFileHashCheckManifest = defineToolManifest({
  id: 'tool-file-hash-check',
  path: '/file-hash-check',
  namespace: 'toolFileHashCheck',
  mode: 'client',
  categoryKey: 'utility',
  icon: FileCheck2,
  keywords: ['hash', '哈希', '校验', 'md5', 'sha-1', 'sha-256', 'sha-512', 'checksum', '完整性'],
  meta: {
    zh: {
      title: '文件哈希校验',
      description: '本地计算 MD5 / SHA-1 / SHA-256 / SHA-512；支持多文件批量、预期哈希自动比对、复制下载',
    },
    en: {
      title: 'File Hash Checker',
      description: 'Compute MD5 / SHA-1 / SHA-256 / SHA-512 locally; multi-file batch, auto-match expected hash, copy & download',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolFileHashCheckManifest
