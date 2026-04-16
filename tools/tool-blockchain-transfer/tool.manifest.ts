import { defineToolManifest } from '@toolbox/tool-registry'
import { Coins } from 'lucide-react'

const toolBlockchainTransferManifest = defineToolManifest({
  id: 'tool-blockchain-transfer',
  path: '/blockchain-transfer',
  namespace: 'toolBlockchainTransfer',
  mode: 'client',
  categoryKey: 'blockchain',
  icon: Coins,
  keywords: ['blockchain', 'crypto', 'eth', 'sol', 'metamask', 'phantom', 'transfer', '转账', '区块链'],
  meta: {
    zh: {
      title: '加密货币转账',
      description: '通过 MetaMask / Phantom 钱包一键发送 ETH、SOL 转账',
    },
    en: {
      title: 'Crypto Transfer',
      description: 'Send ETH and SOL transfers in one click via MetaMask / Phantom wallet',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolBlockchainTransferManifest
