import { defineToolManifest } from '@toolbox/tool-registry'
import { MessageCircle } from 'lucide-react'

const toolTravelConversationManifest = defineToolManifest({
  id: 'tool-travel-conversation',
  path: '/travel-conversation',
  namespace: 'toolTravelConversation',
  mode: 'client',
  categoryKey: 'travel',
  icon: MessageCircle,
  keywords: ['travel', 'conversation', 'English', 'practice', '旅行英语', '对话练习', '英语口语', '场景对话'],
  meta: {
    zh: {
      title: '旅行对话模拟',
      description: '选择场景，练习旅行中的常用英语对话',
    },
    en: {
      title: 'Travel Conversation Practice',
      description: 'Choose scenarios and practice common English conversations for travel',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolTravelConversationManifest
