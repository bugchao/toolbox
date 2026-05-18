import { defineToolManifest } from '@toolbox/tool-registry'
import { Binary } from 'lucide-react'

const toolGuessNumberManifest = defineToolManifest({
  id: 'tool-guess-number',
  path: '/guess-number',
  namespace: 'toolGuessNumber',
  mode: 'client',
  categoryKey: 'social_game',
  icon: Binary,
  keywords: ['guess', 'number', '猜数字', '聚会', '小游戏', 'binary'],
  meta: {
    zh: {
      title: '猜数字',
      description: '电脑出数字让你猜，或自己设数字让朋友猜；带二分提示与历史最佳成绩',
    },
    en: {
      title: 'Guess Number',
      description: 'Computer or friend picks a number; binary-style hints + best-score history',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolGuessNumberManifest
