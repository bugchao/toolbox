import { defineToolManifest } from '@toolbox/tool-registry'
import { Contrast } from 'lucide-react'

const toolContrastCheckerManifest = defineToolManifest({
  id: 'tool-contrast-checker',
  path: '/contrast-checker',
  namespace: 'toolContrastChecker',
  mode: 'client',
  categoryKey: 'dev',
  icon: Contrast,
  keywords: [
    'contrast',
    'wcag',
    'accessibility',
    'a11y',
    'color',
    '对比度',
    '无障碍',
    '颜色',
    '可访问性',
    'aa',
    'aaa',
  ],
  meta: {
    zh: {
      title: 'WCAG 对比度检查器',
      description: '检测前景/背景色的 WCAG 对比度，实时给出 AA/AAA 合规等级与文本预览。',
    },
    en: {
      title: 'WCAG Contrast Checker',
      description: 'Check WCAG color contrast between text and background with live AA/AAA grading and preview.',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolContrastCheckerManifest
