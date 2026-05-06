import { defineToolManifest } from '@toolbox/tool-registry'
import { GitCompare } from 'lucide-react'

const toolCodeDiffManifest = defineToolManifest({
  id: 'tool-code-diff',
  path: '/code-diff',
  namespace: 'toolCodeDiff',
  mode: 'client',
  categoryKey: 'dev',
  icon: GitCompare,
  keywords: ['code-diff', 'diff', 'compare', 'code', '代码对比', '差异', '版本对比'],
  meta: {
    zh: {
      title: '代码差异对比',
      description: '对比两段代码的差异，支持多种编程语言语法高亮和差异可视化',
    },
    en: {
      title: 'Code Diff',
      description: 'Compare code differences with syntax highlighting and visual diff display',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolCodeDiffManifest
