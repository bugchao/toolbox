import { defineToolManifest } from '@toolbox/tool-registry'
import { Calendar as CalendarIcon } from 'lucide-react'

const toolCalendarManifest = defineToolManifest({
  id: 'tool-calendar',
  path: '/calendar',
  namespace: 'toolCalendar',
  mode: 'client',
  categoryKey: 'utils',
  icon: CalendarIcon,
  keywords: ['万年历', '农历', '黄历', '节气', '节假日', '调休', '法定节假日', 'calendar', 'lunar', 'holiday'],
  meta: {
    zh: {
      title: '万年历',
      description: '公历/农历双显、24 节气与传统节日、中国法定节假日调休，支持日/周/月/年视图',
    },
    en: {
      title: 'Perpetual Calendar',
      description: 'Gregorian/lunar dates, solar terms, festivals and Chinese public holidays, with day/week/month/year views',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolCalendarManifest
