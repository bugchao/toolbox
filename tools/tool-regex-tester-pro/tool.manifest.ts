import { defineToolManifest } from '@toolbox/tool-registry'
import { Regex } from 'lucide-react'

const toolRegexTesterProManifest = defineToolManifest({
  id: 'tool-regex-tester-pro',
  path: '/regex-tester-pro',
  namespace: 'toolRegexTesterPro',
  mode: 'client',
  categoryKey: 'dev',
  icon: Regex,
  keywords: ['regex', 'regexp', 'regular expression', 'pattern', '正则', '正则表达式', '匹配'],
  meta: {
    zh: {
      title: '正则表达式测试器',
      description: '测试和调试正则表达式，包含常用模板和实时匹配',
    },
    en: {
      title: 'Regex Tester Pro',
      description: 'Test and debug regular expressions with common templates and live matching',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolRegexTesterProManifest
