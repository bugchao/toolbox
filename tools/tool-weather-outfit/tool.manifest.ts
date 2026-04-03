import { defineToolManifest } from '@toolbox/tool-registry'
import { CloudSun } from 'lucide-react'

const toolWeatherOutfitManifest = defineToolManifest({
  id: 'tool-weather-outfit',
  path: '/weather-outfit',
  namespace: 'toolWeatherOutfit',
  mode: 'client',
  categoryKey: 'travel',
  icon: CloudSun,
  keywords: ['weather', 'outfit', 'travel', '天气', '穿搭'],
  meta: {
    zh: {
      title: '天气穿搭建议',
      description: '按温度、天气、风力和活动场景，快速给出出行穿搭建议',
    },
    en: {
      title: 'Weather Outfit',
      description: 'Get quick outfit suggestions based on temperature, weather, wind, and activity',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolWeatherOutfitManifest
