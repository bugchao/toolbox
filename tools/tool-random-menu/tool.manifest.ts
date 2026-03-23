import type { ToolManifest } from '@toolbox/tool-registry'

const manifest: ToolManifest = {
  path: '/random-menu',
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
  component: () => import('./src/index'),
}

export default manifest
