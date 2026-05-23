import { defineToolManifest } from '@toolbox/tool-registry'
import { Database } from 'lucide-react'

const toolFakeDataGenManifest = defineToolManifest({
  id: 'tool-fake-data-gen',
  path: '/fake-data-gen',
  namespace: 'toolFakeDataGen',
  mode: 'client',
  categoryKey: 'dev',
  icon: Database,
  keywords: ['fake', '假数据', '测试数据', 'mock', 'seed', 'demo', 'csv', 'json', 'sql', 'faker'],
  meta: {
    zh: {
      title: '测试数据生成器',
      description: '批量生成姓名/邮箱/手机/地址/公司等假数据；JSON / CSV / SQL Insert / TypeScript 多格式输出',
    },
    en: {
      title: 'Fake Data Generator',
      description: 'Batch generate name / email / phone / address / company fake data; export as JSON / CSV / SQL Insert / TypeScript',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolFakeDataGenManifest
