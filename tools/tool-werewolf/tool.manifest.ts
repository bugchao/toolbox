import { defineToolManifest } from '@toolbox/tool-registry'
import { Moon } from 'lucide-react'

const toolWerewolfManifest = defineToolManifest({
  id: 'tool-werewolf',
  path: '/werewolf',
  namespace: 'toolWerewolf',
  mode: 'client',
  categoryKey: 'social_game',
  icon: Moon,
  keywords: ['狼人杀', 'werewolf', '聚会', '桌游', '预言家', '女巫', '猎人', 'mafia'],
  meta: {
    zh: {
      title: '狼人杀',
      description: '单设备发牌器：自由配比经典角色，pass-and-flip 私密看身份；适合线下主持',
    },
    en: {
      title: 'Werewolf',
      description: 'Single-device role dealer: configure classic roles, pass-and-flip secret reveal — for in-person play',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolWerewolfManifest
