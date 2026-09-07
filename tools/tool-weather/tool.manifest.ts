import { defineToolManifest } from '@toolbox/tool-registry'

const weatherToolManifest = defineToolManifest({
  id: 'tool-weather',
  path: '/weather',
  namespace: 'toolWeather',
  mode: 'hybrid',
  keywords: ['weather', 'forecast', '天气', '预报', '未来7天', '未来14天', '天气趋势'],
  meta: {
    zh: {
      title: '天气查询',
      description: '默认基于 IP 定位当前城市，一键查看未来 7 天 / 14 天 / 一个月天气，也支持历史回顾与自定义范围。',
    },
    en: {
      title: 'Weather',
      description: 'Resolves your city from IP and gives one-click next 7 days / 14 days / month forecasts, plus historical lookback and custom ranges.',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default weatherToolManifest

