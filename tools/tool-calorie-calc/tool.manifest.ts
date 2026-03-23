import type { ToolManifest } from '@toolbox/tool-registry'

const manifest: ToolManifest = {
  path: '/calorie-calc',
  meta: {
    zh: {
      title: '卡路里估算',
      description: '查询食物热量，估算摄入卡路里',
    },
    en: {
      title: 'Calorie Calculator',
      description: 'Look up food calories and estimate intake',
    },
  },
  component: () => import('./src/index'),
}

export default manifest
