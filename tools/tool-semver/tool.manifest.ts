import { defineToolManifest } from '@toolbox/tool-registry'
import { GitCompareArrows } from 'lucide-react'

const toolSemverManifest = defineToolManifest({
  id: 'tool-semver',
  path: '/semver',
  namespace: 'toolSemver',
  mode: 'client',
  categoryKey: 'dev',
  icon: GitCompareArrows,
  keywords: [
    'semver',
    'semantic version',
    'version',
    'compare',
    'range',
    'caret',
    'tilde',
    'satisfies',
    '版本',
    '语义化版本',
    '比较',
    '范围',
  ],
  meta: {
    zh: {
      title: 'Semver 版本工具',
      description: '语义化版本解析 / 比较 / 排序 / 范围匹配（^ ~ >= || 等）/ 差异级别 / 自增。纯本地零依赖。',
    },
    en: {
      title: 'Semver Toolkit',
      description: 'Parse, compare, sort, range-match (^ ~ >= ||), diff level and bump semantic versions. Fully local, zero deps.',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolSemverManifest
