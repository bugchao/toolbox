import { defineToolManifest } from '@toolbox/tool-registry'

const toolSalaryCalcManifest = defineToolManifest({
  id: 'tool-salary-calc',
  path: '/salary-calc',
  namespace: 'toolSalaryCalc',
  mode: 'client',
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
  loadComponent: () => import('./src/SalaryCalc'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolSalaryCalcManifest
