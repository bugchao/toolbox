import { defineToolManifest } from '@toolbox/tool-registry'
import { Dices } from 'lucide-react'

const toolDiceRollerManifest = defineToolManifest({
  id: 'tool-dice-roller',
  path: '/dice-roller',
  namespace: 'toolDiceRoller',
  mode: 'client',
  categoryKey: 'social_game',
  icon: Dices,
  keywords: ['dice', 'roll', 'random', '骰子', '掷骰', '随机', '桌游', '点数'],
  meta: {
    zh: {
      title: '骰子',
      description: '经典 1-6 点骰子，可选 1~12 颗，带 tumble 滚动动画与 crypto 安全随机',
    },
    en: {
      title: 'Dice',
      description: 'Classic 1–6 pip dice, choose 1–12 dice, with tumble animation and crypto-secure RNG',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolDiceRollerManifest
