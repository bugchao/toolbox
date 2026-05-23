import { defineToolManifest } from '@toolbox/tool-registry'
import { ShieldOff } from 'lucide-react'

const toolDataMaskingManifest = defineToolManifest({
  id: 'tool-data-masking',
  path: '/data-masking',
  namespace: 'toolDataMasking',
  mode: 'client',
  categoryKey: 'dev',
  icon: ShieldOff,
  keywords: ['数据脱敏', '隐私', '日志', 'mask', 'redact', 'pii', '手机号', '身份证'],
  meta: {
    zh: {
      title: '数据脱敏',
      description: '批量脱敏文本中的手机号/身份证/邮箱/银行卡/IP/MAC/车牌等敏感信息；支持自定义正则与命中统计',
    },
    en: {
      title: 'Data Masking',
      description: 'Redact sensitive fields (phone / ID / email / card / IP / MAC / plate) in bulk text with custom regex rules and match stats',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolDataMaskingManifest
