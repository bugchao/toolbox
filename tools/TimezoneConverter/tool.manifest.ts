import { Clock } from 'lucide-react'

export default {
  id: 'tools.timezone_converter',
  path: '/timezone-converter',
  title: '时区转换器',
  description: '多时区时间对比和会议时间转换工具',
  categoryKey: 'travel',
  icon: Clock,
  keywords: ['时区', '转换', '会议', '时间对比'],
  namespace: 'toolTimezoneConverter',
  meta: {
    zh: {
      title: '时区转换器',
      description: '多时区时间对比和会议时间转换工具'
    },
    en: {
      title: 'Timezone Converter',
      description: 'Compare times across different timezones and convert meeting times'
    }
  }
}