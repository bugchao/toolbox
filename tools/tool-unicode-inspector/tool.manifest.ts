import { defineToolManifest } from '@toolbox/tool-registry'
import { Binary } from 'lucide-react'

const toolUnicodeInspectorManifest = defineToolManifest({
  id: 'tool-unicode-inspector',
  path: '/unicode-inspector',
  namespace: 'toolUnicodeInspector',
  mode: 'client',
  categoryKey: 'dev',
  icon: Binary,
  keywords: [
    'unicode',
    'codepoint',
    'utf-8',
    'utf-16',
    'emoji',
    'escape',
    'surrogate',
    '码点',
    '字符',
    '编码',
    '转义',
  ],
  meta: {
    zh: {
      title: 'Unicode 字符检查器',
      description: '逐字符剖析文本：码点 U+、Unicode 块、UTF-8 / UTF-16 字节、JS/HTML/CSS 转义；正确按码点切分 emoji 与代理对，统计码点/UTF-16/UTF-8 长度差异。',
    },
    en: {
      title: 'Unicode Inspector',
      description: 'Break down text char by char: code point, Unicode block, UTF-8 / UTF-16 bytes, JS/HTML/CSS escapes; iterates by code point (emoji-safe) and surfaces code-point vs UTF-16 vs UTF-8 length.',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolUnicodeInspectorManifest
