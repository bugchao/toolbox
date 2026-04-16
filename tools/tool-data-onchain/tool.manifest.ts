import { defineToolManifest } from '@toolbox/tool-registry'
import { Database } from 'lucide-react'

const toolDataOnchainManifest = defineToolManifest({
  id: 'tool-data-onchain',
  path: '/data-onchain',
  namespace: 'toolDataOnchain',
  mode: 'client',
  categoryKey: 'blockchain',
  icon: Database,
  keywords: [
    'blockchain',
    'onchain',
    'ethereum',
    'sepolia',
    'ethers',
    'infura',
    'alchemy',
    'thegraph',
    'subgraph',
    'hardhat',
    '数据上链',
    '链上数据',
    '区块链存储',
    '合约',
    '事件',
    '日志',
  ],
  meta: {
    zh: {
      title: '数据上链 Studio',
      description:
        '基于 Sepolia 测试网的完整数据上链方案：直接存储 + 事件日志，支持 ethers.js / Infura / Alchemy / The Graph 读取，内置自定义加解密。',
    },
    en: {
      title: 'Data On-Chain Studio',
      description:
        'End-to-end on-chain data workflow on Sepolia testnet: direct storage + event logs, read via ethers.js / Infura / Alchemy / The Graph, with built-in custom encryption.',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolDataOnchainManifest
