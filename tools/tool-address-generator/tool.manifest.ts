import { defineToolManifest } from '@toolbox/tool-registry'
import { MapPinned } from 'lucide-react'

const toolAddressGeneratorManifest = defineToolManifest({
  id: 'tool-address-generator',
  path: '/address-generator',
  namespace: 'toolAddressGenerator',
  mode: 'client',
  categoryKey: 'dev',
  icon: MapPinned,
  keywords: ['地址生成器', '随机地址', '国际地址', '测试地址', 'address', 'country', 'postal', 'fake', 'seed'],
  meta: {
    zh: {
      title: '多国家地址生成器',
      shortTitle: '地址生成器',
      description: '按国家格式批量生成可复现的合成地址，支持复制与 JSON / CSV / TXT 导出',
    },
    en: {
      title: 'Global Address Generator',
      shortTitle: 'Address Generator',
      description: 'Generate reproducible synthetic addresses in country-aware formats, then copy or export them',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolAddressGeneratorManifest
