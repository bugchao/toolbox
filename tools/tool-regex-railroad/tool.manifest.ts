import { defineToolManifest } from '@toolbox/tool-registry'
import { Workflow } from 'lucide-react'

const toolRegexRailroadManifest = defineToolManifest({
  id: 'tool-regex-railroad',
  path: '/regex-railroad',
  namespace: 'toolRegexRailroad',
  mode: 'client',
  categoryKey: 'dev',
  icon: Workflow,
  keywords: [
    'regex',
    'regular expression',
    'railroad',
    'diagram',
    'visualize',
    'ast',
    '正则',
    '可视化',
    '铁路图',
    '解析',
  ],
  meta: {
    zh: {
      title: 'Regex 铁路图',
      description: '把任意 JS 正则解析为 AST 并绘制成铁路图（railroad diagram），同时支持匹配测试与逐 token 解释。',
    },
    en: {
      title: 'Regex Railroad Diagram',
      description: 'Parse any JS regex into its AST and draw the railroad diagram; live match tester and per-token explanations included.',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolRegexRailroadManifest
