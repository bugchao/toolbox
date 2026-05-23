// 3 套名片模板配置 —— 仅定义视觉风格，布局在 CardPreview 里按 templateId 分支渲染

export type TemplateId = 'minimal' | 'stripe' | 'modern'

export interface TemplateMeta {
  id: TemplateId
  zh: string
  en: string
  defaultColor: string
}

export const TEMPLATES: TemplateMeta[] = [
  { id: 'minimal', zh: '极简', en: 'Minimal', defaultColor: '#111827' },
  { id: 'stripe', zh: '侧栏色块', en: 'Side Stripe', defaultColor: '#4338ca' },
  { id: 'modern', zh: '渐变现代', en: 'Modern Gradient', defaultColor: '#7c3aed' },
]

export interface CardData {
  template: TemplateId
  accentColor: string
  name: string
  title: string
  company: string
  phone: string
  email: string
  website: string
  address: string
  tagline: string
  showQr: boolean
  qrTarget: 'vcard' | 'website'
}

export const DEFAULT_CARD: CardData = {
  template: 'minimal',
  accentColor: '#4338ca',
  name: '张三',
  title: '高级工程师',
  company: 'Toolbox Tech',
  phone: '+86 138 0000 0000',
  email: 'zhangsan@example.com',
  website: 'https://toolbox.example.com',
  address: '北京市朝阳区',
  tagline: 'Make work effortless',
  showQr: true,
  qrTarget: 'vcard',
}

export function buildVCard(d: CardData): string {
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${d.name}`,
    d.title ? `TITLE:${d.title}` : '',
    d.company ? `ORG:${d.company}` : '',
    d.phone ? `TEL;TYPE=CELL:${d.phone}` : '',
    d.email ? `EMAIL:${d.email}` : '',
    d.website ? `URL:${d.website}` : '',
    d.address ? `ADR;TYPE=WORK:;;${d.address};;;;` : '',
    'END:VCARD',
  ]
  return lines.filter(Boolean).join('\n')
}
