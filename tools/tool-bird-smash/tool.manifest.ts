import { defineToolManifest } from '@toolbox/tool-registry'
import { Gamepad2 } from 'lucide-react'

const toolBirdSmashManifest = defineToolManifest({
  id: 'tool-bird-smash',
  path: '/bird-smash',
  namespace: 'toolBirdSmash',
  mode: 'client',
  categoryKey: 'social_game',
  icon: Gamepad2,
  keywords: ['angry birds', 'slingshot', 'physics', 'matter-js', 'game', '弹弓', '物理', '小游戏', '愤怒的小鸟'],
  meta: {
    zh: {
      title: '愤怒的小鸟 (Bird Smash)',
      description: '物理弹射小游戏：拖拽弹弓发射不同能力的小鸟，摧毁木箱、石块和玻璃，击败敌人！',
    },
    en: {
      title: 'Bird Smash',
      description: 'Physics slingshot game: Launch birds with unique abilities to destroy structures and defeat enemies!',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolBirdSmashManifest
