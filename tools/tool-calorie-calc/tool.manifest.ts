import { defineToolManifest } from '@toolbox/tool-registry'

const toolCalorieCalcManifest = defineToolManifest({
  id: 'tool-calorie-calc',
  path: '/calorie-calc',
  namespace: 'toolCalorieCalc',
  mode: 'client',
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
  loadComponent: () => import('./src/CalorieCalc'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolCalorieCalcManifest
