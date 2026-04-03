import { defineToolManifest } from '@toolbox/tool-registry'
import { Camera } from 'lucide-react'

const toolPhotoSpotsManifest = defineToolManifest({
  id: 'tool-photo-spots',
  path: '/photo-spots',
  namespace: 'toolPhotoSpots',
  mode: 'client',
  categoryKey: 'travel',
  icon: Camera,
  keywords: ['travel', 'photo', 'spots', '拍照', '机位'],
  meta: {
    zh: {
      title: '拍照点推荐',
      description: '按城市气质、拍摄风格和光线时段推荐更容易出片的机位',
    },
    en: {
      title: 'Photo Spots',
      description: 'Recommend shoot-ready spots by city mood, shooting style, and light window',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolPhotoSpotsManifest
