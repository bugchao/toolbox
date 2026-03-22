import { defineToolManifest } from '@toolbox/tool-registry'

const weatherToolManifest = defineToolManifest({
  id: 'tool-weather',
  path: '/weather',
  namespace: 'toolWeather',
  mode: 'hybrid',
  keywords: ['weather', 'forecast', '天气', '预报'],
  meta: {
    zh: {
      title: '天气查询',
      description: '默认基于 IP 定位当前城市，支持最近 7 天、最近 30 天以及自定义时间范围天气查询。',
    },
    en: {
      title: 'Weather',
      description: 'Default to IP-based location lookup and support weather queries for the last 7 days, last 30 days, or a custom range.',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default weatherToolManifest

