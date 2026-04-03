import { defineToolManifest } from '@toolbox/tool-registry'
import { BrainCircuit } from 'lucide-react'

const toolProcrastinationTestManifest = defineToolManifest({
  id: 'tool-procrastination-test',
  path: '/procrastination-test',
  namespace: 'toolProcrastinationTest',
  mode: 'client',
  categoryKey: 'life',
  icon: BrainCircuit,
  keywords: ['procrastination', 'focus', 'habit', '拖延', '专注'],
  meta: {
    zh: {
      title: '拖延症评估',
      description: '通过轻量问卷识别拖延触发点，并给出改善建议',
    },
    en: {
      title: 'Procrastination Test',
      description: 'Spot procrastination triggers with a short assessment and actionable tips',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolProcrastinationTestManifest
