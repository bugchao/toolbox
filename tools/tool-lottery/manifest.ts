import { defineToolManifest } from '@toolbox/tool-registry'
import { Ticket } from 'lucide-react'

export default defineToolManifest({
  id: 'lottery',
  path: '/lottery',
  namespace: 'toolLottery',
  categoryKey: 'entertainment',
  icon: Ticket,
  keywords: ['lottery', 'draw', 'random', 'raffle', '抽签', '抽奖', '随机', '抽取'],
  meta: {
    zh: {
      title: '抽签工具',
      description: '随机抽取选项，支持自定义列表和抽取规则'
    },
    en: {
      title: 'Lottery Tool',
      description: 'Randomly draw options with customizable lists and rules'
    }
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./locales/zh-CN.json'),
    en: () => import('./locales/en-US.json')
  }
})
