import { defineToolManifest } from '@toolbox/tool-registry'
import { Binary } from 'lucide-react'

const toolNumberBaseManifest = defineToolManifest({
  id: 'tool-number-base',
  path: '/number-base',
  namespace: 'toolNumberBase',
  mode: 'client',
  categoryKey: 'dev',
  icon: Binary,
  keywords: [
    'base',
    'radix',
    'binary',
    'hex',
    'bitwise',
    'two complement',
    'bigint',
    '进制',
    '位运算',
    '补码',
    '大整数',
  ],
  meta: {
    zh: {
      title: '进制 & 位运算计算器',
      description: '任意进制（2–36）互转 + BigInt 大整数 + 补码位视图（8/16/32/64 位）+ 位运算（AND/OR/XOR/NOT/移位）；纯本地。',
    },
    en: {
      title: 'Base & Bitwise Calculator',
      description: 'Convert across any radix (2–36) with BigInt support, two’s-complement bit views (8/16/32/64-bit) and bitwise ops (AND/OR/XOR/NOT/shift). Fully local.',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolNumberBaseManifest
