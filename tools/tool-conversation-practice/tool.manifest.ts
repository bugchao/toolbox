import { defineToolManifest } from '@toolbox/tool-registry'
import { Languages } from 'lucide-react'

const toolConversationPracticeManifest = defineToolManifest({
  id: 'tool-conversation-practice',
  path: '/conversation-practice',
  namespace: 'toolConversationPractice',
  mode: 'client',
  categoryKey: 'learn',
  icon: Languages,
  keywords: ['conversation practice', '口语练习', '沟通', '对话'],
  meta: {
    zh: {
      title: '对话练习助手',
      description: '按场景、语气和熟练度生成一组可直接练习的表达',
    },
    en: {
      title: 'Conversation Practice',
      description: 'Build reusable conversation prompts from scene, tone, and fluency level',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolConversationPracticeManifest
