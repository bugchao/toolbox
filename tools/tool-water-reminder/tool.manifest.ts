import { defineToolManifest } from '@toolbox/tool-registry'
import { Droplet } from 'lucide-react'

const toolWaterReminderManifest = defineToolManifest({
  id: 'tool-water-reminder',
  path: '/water-reminder',
  namespace: 'toolWaterReminder',
  mode: 'client',
  categoryKey: 'life',
  icon: Droplet,
  keywords: ['water', 'reminder', 'hydration', 'health', '饮水提醒', '饮水记录', '健康管理', '喝水提醒'],
  meta: {
    zh: {
      title: '饮水提醒工具',
      description: '记录每日饮水量，养成健康饮水习惯',
    },
    en: {
      title: 'Water Reminder',
      description: 'Track daily water intake and develop healthy drinking habits',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolWaterReminderManifest
