import { defineToolManifest } from '@toolbox/tool-registry'
import { Camera } from 'lucide-react'

const toolIdPhotoManifest = defineToolManifest({
  id: 'tool-id-photo',
  path: '/id-photo',
  namespace: 'toolIdPhoto',
  mode: 'client',
  categoryKey: 'utils',
  icon: Camera,
  keywords: ['ID', 'photo', 'passport', 'background', '证件照', '背景更换', '标准尺寸', '照片处理'],
  meta: {
    zh: {
      title: '证件照工具',
      description: '标准尺寸裁剪、背景色更换',
    },
    en: {
      title: 'ID Photo Tool',
      description: 'Standard size cropping and background color replacement',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolIdPhotoManifest
