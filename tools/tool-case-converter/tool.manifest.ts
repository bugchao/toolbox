import { defineToolManifest } from '@toolbox/tool-registry'
import { CaseSensitive } from 'lucide-react'

const toolCaseConverterManifest = defineToolManifest({
  id: 'tool-case-converter',
  path: '/case-converter',
  namespace: 'toolCaseConverter',
  mode: 'client',
  categoryKey: 'dev',
  icon: CaseSensitive,
  keywords: [
    'case',
    'camelcase',
    'snake_case',
    'kebab-case',
    'pascalcase',
    'constant',
    'title case',
    'convert',
    '命名',
    '驼峰',
    '下划线',
    '转换',
  ],
  meta: {
    zh: {
      title: '命名风格转换',
      description: '把任意文本拆词后一键转 camelCase / PascalCase / snake_case / CONSTANT_CASE / kebab-case / Title Case 等 13 种风格；支持批量逐行、中英混排与连续大写。',
    },
    en: {
      title: 'Case Converter',
      description: 'Tokenize any text and convert to 13 styles — camelCase, PascalCase, snake_case, CONSTANT_CASE, kebab-case, Title Case and more; batch line mode, CJK-aware, smart acronym splitting.',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolCaseConverterManifest
