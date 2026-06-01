import { defineToolManifest } from '@toolbox/tool-registry'
import { WandSparkles } from 'lucide-react'

const toolAiTranslatorManifest = defineToolManifest({
  id: 'tool-ai-translator',
  path: '/ai-translator',
  namespace: 'toolAiTranslator',
  mode: 'client',
  categoryKey: 'ai',
  icon: WandSparkles,
  keywords: [
    'translate',
    'translation',
    'ai',
    'llm',
    'openai',
    'claude',
    'anthropic',
    'gemini',
    'deepseek',
    'moonshot',
    'qwen',
    'ollama',
    'webllm',
    '翻译',
    'AI 翻译',
    '大模型',
    '本地模型',
    '浏览器模型',
  ],
  meta: {
    zh: {
      title: 'AI 翻译',
      description: '基于大模型的多端翻译：云端 API（OpenAI / Claude / Gemini / DeepSeek / Moonshot / 通义） + 本地服务（Ollama） + 浏览器内 WebLLM；API Key 与模型选择全部存本地，流式输出。',
    },
    en: {
      title: 'AI Translator',
      description: 'LLM-powered translation across cloud APIs (OpenAI / Claude / Gemini / DeepSeek / Moonshot / Qwen), local servers (Ollama), and in-browser WebLLM — API keys and model preferences live in localStorage, with streaming output.',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolAiTranslatorManifest
