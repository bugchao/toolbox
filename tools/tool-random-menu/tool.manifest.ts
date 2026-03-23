import { defineToolManifest } from '@toolbox/tool-registry'

const toolRandomMenuManifest = defineToolManifest({
  id: 'tool-random-menu',
  path: '/random-menu',
  namespace: 'toolRandomMenu',
  mode: 'client',
  meta: {
    zh: {
      title: '随机菜单生成器',
      description: '解决每天吃什么的选择困难症',
    },
    en: {
      title: 'Random Menu Generator',
      description: 'Solve the daily dilemma of what to eat',
    },
  },
  loadComponent: () => import('./src/RandomMenu'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolRandomMenuManifest
