import { defineToolManifest } from '@toolbox/tool-registry'
import { Ticket } from 'lucide-react'

const toolLotteryManifest = defineToolManifest({
  id: 'tool-lottery',
  path: '/lottery',
  namespace: 'toolLottery',
  mode: 'client',
  categoryKey: 'utils',
  icon: Ticket,
  keywords: ['lottery', 'draw', 'random', 'raffle', '抽签', '抽奖', '随机'],
  meta: {
    zh: {
      title: '抽签工具',
      description: '公平随机抽签，支持多种抽签模式和权重设置',
    },
    en: {
      title: 'Lottery Tool',
      description: 'Fair random lottery with multiple modes and weight settings',
    },
  },
  loadComponent: () => import('./src/Lottery'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolLotteryManifest
