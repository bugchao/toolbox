import { ImageIcon } from 'lucide-react'
import { defineToolManifest } from '@toolbox/tool-registry'

const toolIdPhotoManifest = defineToolManifest({
  id: 'tool-id-photo',
  path: '/id-photo',
  namespace: 'toolIdPhoto',
  mode: 'client',
  categoryKey: 'utils',
  icon: ImageIcon,
  keywords: ['证件照', '换底色', '照片', '身份证', '护照', 'id photo'],
  meta: {
    zh: {
      title: '证件照工具',
      description: '标准证件照尺寸生成和智能换底色',
    },
    en: {
      title: 'ID Photo Tool',
      description: 'Generate standard ID photos with smart background replacement',
    },
  },
  loadComponent: () => import('./src/IdPhoto'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolIdPhotoManifest