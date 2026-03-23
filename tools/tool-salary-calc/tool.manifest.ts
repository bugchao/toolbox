import type { ToolManifest } from '@toolbox/tool-registry'

const manifest: ToolManifest = {
  path: '/salary-calc',
  meta: {
    zh: {
      title: '工资税后计算器',
      description: '计算五险一金和个税，得出税后工资',
    },
    en: {
      title: 'Salary Calculator',
      description: 'Calculate social insurance, tax, and net salary',
    },
  },
  component: () => import('./src/index'),
}

export default manifest
