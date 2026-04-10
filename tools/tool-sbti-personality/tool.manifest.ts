import { defineToolManifest } from '@toolbox/tool-registry'
import { Fingerprint } from 'lucide-react'

const toolSbtiPersonalityManifest = defineToolManifest({
  id: 'tool-sbti-personality',
  path: '/sbti-personality',
  namespace: 'toolSbtiPersonality',
  mode: 'client',
  categoryKey: 'life',
  icon: Fingerprint,
  keywords: ['sbti', 'personality', 'profile', '人格', '测试', '画像'],
  meta: {
    zh: {
      title: 'SBTI 人格测试',
      description: '通过四维问卷生成你的社交、行动、思维与自主画像，并给出场景建议',
    },
    en: {
      title: 'SBTI Personality Test',
      description: 'Map your social, action, thinking, and independence profile with a four-signal assessment',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolSbtiPersonalityManifest
