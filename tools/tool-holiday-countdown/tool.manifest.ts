import { defineToolManifest } from '@toolbox/tool-registry'
import { CalendarHeart } from 'lucide-react'

const toolHolidayCountdownManifest = defineToolManifest({
  id: 'tool-holiday-countdown',
  path: '/holiday-countdown',
  namespace: 'toolHolidayCountdown',
  mode: 'client',
  categoryKey: 'life',
  icon: CalendarHeart,
  keywords: ['节日', '倒计时', '生日', '纪念日', 'countdown', 'holiday', 'birthday'],
  meta: {
    zh: {
      title: '节日倒计时',
      description: '内置中国主要节日（含农历）+ 自定义生日/纪念日；多卡并排显示「N 天 H 时 M 分」，过期自动滚下一年',
    },
    en: {
      title: 'Holiday Countdown',
      description: 'Built-in Chinese holidays (incl. lunar) + custom birthdays/anniversaries; live "N days HH:MM" on every card, auto-rolls to next year',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolHolidayCountdownManifest
