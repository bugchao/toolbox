import type { ToolManifest } from '../../../apps/web/src/types/tool';

const manifest: ToolManifest = {
  id: 'barcode-reader',
  name: 'BarcodeReader',
  path: '/barcode-reader',
  categoryKey: 'utils',
  icon: '📷',
  title: {
    zh: '条形码识别',
    en: 'Barcode Reader',
  },
  description: {
    zh: '上传图片或手动输入，快速识别条形码',
    en: 'Upload image or manual input to quickly recognize barcodes',
  },
  keywords: {
    zh: ['条形码识别', '条形码扫描', '商品查询', '条码解析', '图片识别'],
    en: ['barcode reader', 'barcode scanner', 'product lookup', 'barcode parser', 'image recognition'],
  },
};

export default manifest;
