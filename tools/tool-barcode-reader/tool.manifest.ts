import { defineToolManifest } from '@toolbox/tool-registry'
import { ScanBarcode } from 'lucide-react'

const toolBarcodeReaderManifest = defineToolManifest({
  id: 'tool-barcode-reader',
  path: '/barcode-reader',
  namespace: 'toolBarcodeReader',
  mode: 'client',
  categoryKey: 'utils',
  icon: ScanBarcode,
  keywords: ['barcode', 'scanner', 'reader', 'QR', '条形码识别', '条形码扫描', '商品查询', '图片识别'],
  meta: {
    zh: {
      title: '条形码识别',
      description: '上传图片或手动输入，快速识别条形码',
    },
    en: {
      title: 'Barcode Reader',
      description: 'Upload image or manual input to quickly recognize barcodes',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolBarcodeReaderManifest
