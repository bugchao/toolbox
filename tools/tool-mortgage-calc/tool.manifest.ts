import { defineToolManifest } from '@toolbox/tool-registry'

const toolMortgageCalcManifest = defineToolManifest({
  id: 'tool-mortgage-calc',
  path: '/mortgage-calc',
  namespace: 'toolMortgageCalc',
  mode: 'client',
  meta: {
    zh: {
      title: '房贷计算器',
      description: '计算房贷月供、总利息，支持商业贷款、公积金贷款和组合贷款',
    },
    en: {
      title: 'Mortgage Calculator',
      description: 'Calculate mortgage payments and total interest for commercial, provident fund, and combined loans',
    },
  },
  loadComponent: () => import('./src/MortgageCalc'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolMortgageCalcManifest
