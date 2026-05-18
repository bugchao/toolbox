import { defineToolManifest } from '@toolbox/tool-registry'
import { Contact } from 'lucide-react'

const toolBusinessCardManifest = defineToolManifest({
  id: 'tool-business-card',
  path: '/business-card',
  namespace: 'toolBusinessCard',
  mode: 'client',
  categoryKey: 'utility',
  icon: Contact,
  keywords: ['名片', '名片设计', 'business card', 'vcard', 'qr', '设计'],
  meta: {
    zh: {
      title: '名片生成器',
      description: '3 套模板的在线名片设计：实时预览、自定义配色、自动生成 vCard 二维码、一键导出 PNG / PDF',
    },
    en: {
      title: 'Business Card',
      description: '3-template online card designer: live preview, custom palette, auto vCard QR, one-click PNG / PDF export',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolBusinessCardManifest
