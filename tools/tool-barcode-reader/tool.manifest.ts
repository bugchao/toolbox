import { ScanLine } from 'lucide-react'
import { defineToolManifest } from '@toolbox/tool-registry'

const toolBarcodeReaderManifest = defineToolManifest({
  id: 'tool-barcode-reader',
  path: '/barcode-reader',
  namespace: 'toolBarcodeReader',
  mode: 'client',
  categoryKey: 'utils',
  icon: ScanLine,
  keywords: ['条形码', 'barcode', '识别', '扫描'],
  meta: {
    zh: {
      title: '条形码识别',
      description: '识别与解析常见条形码内容',
    },
    en: {
      title: 'Barcode Reader',
      description: 'Scan and decode common barcode formats',
    },
  },
  loadComponent: () => import('./src/BarcodeReader'),
  loadMessages: {
    zh: () => import('./locales/zh-CN.json'),
    en: () => import('./locales/en-US.json'),
  },
})

export default toolBarcodeReaderManifest
