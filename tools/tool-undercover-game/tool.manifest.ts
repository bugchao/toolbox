import { defineToolManifest } from '@toolbox/tool-registry'
import { UserSearch } from 'lucide-react'

const toolUndercoverGameManifest = defineToolManifest({
  id: 'tool-undercover-game',
  path: '/undercover-game',
  namespace: 'toolUndercoverGame',
  mode: 'client',
  categoryKey: 'social_game',
  icon: UserSearch,
  keywords: ['谁是卧底', '社交', '推理', '聚会', '游戏', 'undercover', 'spyfall', 'party'],
  meta: {
    zh: {
      title: '谁是卧底',
      description: '单设备多人桌游：随机分配词对与身份，传递手机翻牌看身份，描述+投票淘汰，自动判胜负',
    },
    en: {
      title: 'Undercover',
      description: 'Single-device party game: secret roles + similar words, pass-and-reveal cards, vote out and auto-detect winner',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolUndercoverGameManifest
