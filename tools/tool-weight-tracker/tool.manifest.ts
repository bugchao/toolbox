import { defineToolManifest } from '@toolbox/tool-registry'
import { Scale } from 'lucide-react'

const toolWeightTrackerManifest = defineToolManifest({
  id: 'tool-weight-tracker',
  path: '/weight-tracker',
  namespace: 'toolWeightTracker',
  mode: 'client',
  categoryKey: 'life',
  icon: Scale,
  keywords: ['体重', '减肥', 'BMI', '健康', '记录', 'weight', 'tracker', 'health'],
  meta: {
    zh: {
      title: '体重记录',
      description: '每日记录体重，可视化趋势曲线，动态 BMI 与目标进度条；纯前端、本地存储',
    },
    en: {
      title: 'Weight Tracker',
      description:
        'Log daily weight, visualize trend curve, dynamic BMI and goal progress bar; client-side with local storage',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolWeightTrackerManifest
