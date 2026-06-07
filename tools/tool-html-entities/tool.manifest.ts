import { defineToolManifest } from '@toolbox/tool-registry'
import { Code2 } from 'lucide-react'

const toolHtmlEntitiesManifest = defineToolManifest({
  id: 'tool-html-entities',
  path: '/html-entities',
  namespace: 'toolHtmlEntities',
  mode: 'client',
  categoryKey: 'dev',
  icon: Code2,
  keywords: [
    'html',
    'entities',
    'encode',
    'decode',
    'escape',
    'unescape',
    'amp',
    'nbsp',
    'unicode',
    'HTML 实体',
    '编码',
    '解码',
    '转义',
    '反转义',
    '字符实体',
  ],
  meta: {
    zh: {
      title: 'HTML 实体编解码',
      description:
        '本地双向编解码 HTML 实体：支持 minimal / 命名实体表 / 非 ASCII 十进制 / 十六进制 / 命名优先回退 hex 五种强度，解码宽松、可处理 emoji 与 CJK，不上传数据。',
    },
    en: {
      title: 'HTML Entity Encoder & Decoder',
      description:
        'Two-way HTML entity converter that runs fully in the browser. Five encoding strengths (minimal, named, decimal/hex code points, named-with-hex fallback), lenient decoding for legacy markup, and full Unicode / emoji support.',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolHtmlEntitiesManifest
