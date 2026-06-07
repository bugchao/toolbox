import { defineToolManifest } from '@toolbox/tool-registry'
import { Palette } from 'lucide-react'

const toolColorFormatManifest = defineToolManifest({
  id: 'tool-color-format',
  path: '/color-format',
  namespace: 'toolColorFormat',
  mode: 'client',
  categoryKey: 'dev',
  icon: Palette,
  keywords: [
    'color',
    'convert',
    'hex',
    'rgb',
    'hsl',
    'hwb',
    'lab',
    'lch',
    'oklab',
    'oklch',
    'p3',
    'wcag',
    'contrast',
    '颜色',
    '色彩',
    '转换',
    '对比度',
    '色域',
  ],
  meta: {
    zh: {
      title: '颜色格式互转',
      description: '在 hex / rgb / hsl / hwb / lab / lch / oklch / oklab 等多种颜色格式之间互转，附带 WCAG 对比度提示与 P3 色域警告。',
    },
    en: {
      title: 'Color Format Converter',
      description: 'Convert between hex, rgb, hsl, hwb, lab, lch, oklch, oklab and named colors, with WCAG contrast hints and P3 gamut warnings.',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolColorFormatManifest
