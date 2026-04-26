import { defineToolManifest } from '@toolbox/tool-registry'
import { MessageSquare } from 'lucide-react'

const toolAiChatHubManifest = defineToolManifest({
  id: 'tool-ai-chat-hub',
  path: '/ai-chat-hub',
  namespace: 'toolAiChatHub',
  mode: 'client',
  categoryKey: 'ai',
  icon: MessageSquare,
  keywords: [
    'ai', 'chat', 'chatgpt', 'gemini', 'deepseek', 'grok',
    'compare', 'concurrent', 'multi-ai',
    'AI', '聊天', '对比', '并发'
  ],
  meta: {
    zh: {
      title: 'AI 聊天中心',
      description: '同时与多个 AI（ChatGPT、Gemini、DeepSeek、Grok）对话并对比回答',
    },
    en: {
      title: 'AI Chat Hub',
      description: 'Chat with multiple AIs (ChatGPT, Gemini, DeepSeek, Grok) simultaneously and compare responses',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolAiChatHubManifest
