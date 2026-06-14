import { defineToolManifest } from '@toolbox/tool-registry'
import { FileDiff } from 'lucide-react'

const toolDiffPatchManifest = defineToolManifest({
  id: 'tool-diff-patch',
  path: '/diff-patch',
  namespace: 'toolDiffPatch',
  mode: 'client',
  categoryKey: 'dev',
  icon: FileDiff,
  keywords: [
    'diff',
    'patch',
    'unified',
    'apply',
    'hunk',
    'compare',
    '补丁',
    '差异',
    '对比',
    '应用',
  ],
  meta: {
    zh: {
      title: 'Diff / Patch 工具',
      description: '两段文本生成 unified diff（可调上下文行数），或把 patch 应用回原文；按行着色 + 增删统计，纯本地。',
    },
    en: {
      title: 'Diff / Patch',
      description: 'Generate a unified diff from two texts (adjustable context), or apply a patch back onto a source; color-coded lines and add/del stats. Fully local.',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolDiffPatchManifest
