import { defineToolManifest } from '@toolbox/tool-registry'
import { Wrench } from 'lucide-react'

const toolScreenRecorderManifest = defineToolManifest({
  id: 'tool-screen-recorder',
  path: '/screen-recorder',
  namespace: 'toolScreenRecorder',
  mode: 'client',
  categoryKey: 'utility',   // TODO: change to: network | dev | life | travel | utility | ai | query | learning
  icon: Wrench,             // TODO: change to appropriate lucide-react icon
  keywords: ['screen-recorder'],
  meta: {
    zh: {
      title: 'ScreenRecorder',
      description: 'TODO: 补充中文描述',
    },
    en: {
      title: 'ScreenRecorder',
      description: 'TODO: Add an English description',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolScreenRecorderManifest
