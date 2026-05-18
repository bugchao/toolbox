import { defineToolManifest } from '@toolbox/tool-registry'
import { Receipt } from 'lucide-react'

const toolTaxCalcManifest = defineToolManifest({
  id: 'tool-tax-calc',
  path: '/tax-calc',
  namespace: 'toolTaxCalc',
  mode: 'client',
  categoryKey: 'life',
  icon: Receipt,
  keywords: ['个税', '所得税', 'iit', '年终奖', '专项附加', 'tax', 'salary', 'china'],
  meta: {
    zh: {
      title: '个税计算器',
      description: '中国个税累计预扣预缴模型：12 月月度税表、7 级综合所得税率、专项附加扣除、年终奖单独/合并计税对比',
    },
    en: {
      title: 'IIT Calculator (China)',
      description: 'China Individual Income Tax: 12-month accumulating withholding, 7-tier brackets, itemized deductions, year-end bonus single vs merged comparison',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolTaxCalcManifest
