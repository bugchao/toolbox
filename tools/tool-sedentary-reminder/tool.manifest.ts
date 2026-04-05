import { defineToolManifest } from '@toolbox/tool-registry'
import { Armchair } from 'lucide-react'

const toolSedentaryReminderManifest = defineToolManifest({
  id: 'tool-sedentary-reminder',
  path: '/sedentary-reminder',
  namespace: 'toolSedentaryReminder',
  mode: 'client',
  categoryKey: 'life',
  icon: Armchair,
  keywords: ['sedentary', 'reminder', 'health', 'stretch', '久坐提醒', '健康提醒', '拉伸建议', '办公健康'],
  meta: {
    zh: {
      title: '久坐提醒工具',
      description: '定时提醒起身活动，保护颈椎和腰椎健康',
    },
    en: {
      title: 'Sedentary Reminder',
      description: 'Remind you to stand up and move regularly to protect your health',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolSedentaryReminderManifest
