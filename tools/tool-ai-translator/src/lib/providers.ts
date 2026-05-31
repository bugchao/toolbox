/**
 * Provider 注册表 —— 描述各家 LLM 的接入方式（协议、默认 endpoint、模型）。
 *
 * Protocol 区分：
 * - 'openai'    : OpenAI 兼容（/chat/completions），SSE 流式 data: {"choices":[{"delta":{"content":"..."}}]}
 * - 'anthropic' : Anthropic Messages（/messages），SSE 事件 content_block_delta
 * - 'gemini'    : Google AI Studio REST，alt=sse 流式 candidates[].content.parts[].text
 * - 'ollama'    : Ollama /api/chat，逐行 JSON {"message":{"content":"..."},"done":false}
 */

export type Protocol = 'openai' | 'anthropic' | 'gemini' | 'ollama'
export type ProviderKind = 'cloud' | 'local' | 'webllm' | 'custom'

export type ProviderDef = {
  id: string
  /** UI 显示名 */
  label: string
  kind: ProviderKind
  protocol: Protocol
  /** 默认 endpoint base（不含末尾 /） */
  defaultBaseUrl: string
  /** 是否需要 API Key（local / webllm 通常不需要） */
  requiresApiKey: boolean
  /** 推荐模型列表（用户可改） */
  models: string[]
  /** 默认模型 */
  defaultModel: string
  /** 文案 hint（i18n key） */
  hintKey?: string
}

export const PROVIDERS: ProviderDef[] = [
  {
    id: 'openai',
    label: 'OpenAI',
    kind: 'cloud',
    protocol: 'openai',
    defaultBaseUrl: 'https://api.openai.com/v1',
    requiresApiKey: true,
    models: [
      'gpt-4o-mini',
      'gpt-4o',
      'gpt-4.1',
      'gpt-4.1-mini',
      'gpt-4.1-nano',
      'gpt-4-turbo',
      'gpt-4',
      'gpt-3.5-turbo',
      'o1',
      'o1-mini',
      'o3-mini',
    ],
    defaultModel: 'gpt-4o-mini',
  },
  {
    id: 'anthropic',
    label: 'Anthropic Claude',
    kind: 'cloud',
    protocol: 'anthropic',
    defaultBaseUrl: 'https://api.anthropic.com/v1',
    requiresApiKey: true,
    models: [
      'claude-haiku-4-5',
      'claude-sonnet-4-6',
      'claude-opus-4-1',
      'claude-3-7-sonnet-latest',
      'claude-3-5-haiku-latest',
      'claude-3-5-sonnet-latest',
      'claude-3-opus-latest',
      'claude-3-haiku-20240307',
    ],
    defaultModel: 'claude-haiku-4-5',
  },
  {
    id: 'gemini',
    label: 'Google Gemini',
    kind: 'cloud',
    protocol: 'gemini',
    defaultBaseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    requiresApiKey: true,
    models: [
      'gemini-2.0-flash',
      'gemini-2.0-flash-lite',
      'gemini-2.0-pro-exp',
      'gemini-2.0-flash-thinking-exp',
      'gemini-1.5-flash',
      'gemini-1.5-flash-8b',
      'gemini-1.5-pro',
    ],
    defaultModel: 'gemini-2.0-flash',
  },
  {
    id: 'deepseek',
    label: 'DeepSeek',
    kind: 'cloud',
    protocol: 'openai',
    defaultBaseUrl: 'https://api.deepseek.com/v1',
    requiresApiKey: true,
    models: ['deepseek-chat', 'deepseek-reasoner', 'deepseek-coder'],
    defaultModel: 'deepseek-chat',
  },
  {
    id: 'moonshot',
    label: 'Moonshot Kimi',
    kind: 'cloud',
    protocol: 'openai',
    defaultBaseUrl: 'https://api.moonshot.cn/v1',
    requiresApiKey: true,
    models: [
      'moonshot-v1-8k',
      'moonshot-v1-32k',
      'moonshot-v1-128k',
      'moonshot-v1-auto',
      'kimi-latest',
    ],
    defaultModel: 'moonshot-v1-8k',
  },
  {
    id: 'qwen',
    label: '通义千问 (Qwen)',
    kind: 'cloud',
    protocol: 'openai',
    defaultBaseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    requiresApiKey: true,
    models: [
      'qwen-plus',
      'qwen-turbo',
      'qwen-max',
      'qwen-long',
      'qwen2.5-72b-instruct',
      'qwen2.5-32b-instruct',
      'qwen2.5-14b-instruct',
      'qwen2.5-7b-instruct',
      'qwen-coder-plus',
      'qwen-vl-plus',
    ],
    defaultModel: 'qwen-plus',
  },
  {
    id: 'custom',
    label: 'OpenAI 兼容自定义',
    kind: 'custom',
    protocol: 'openai',
    defaultBaseUrl: 'http://localhost:8080/v1',
    requiresApiKey: false,
    models: [],
    defaultModel: '',
    hintKey: 'provider.customHint',
  },
  {
    id: 'ollama',
    label: 'Ollama (本地)',
    kind: 'local',
    protocol: 'ollama',
    defaultBaseUrl: 'http://localhost:11434',
    requiresApiKey: false,
    // 这些是常见预设，仅作建议；可以直接在输入框里填任意 `ollama pull` 过的 tag。
    models: [
      'qwen2.5:3b',
      'qwen2.5:7b',
      'qwen2.5:14b',
      'qwen2.5:32b',
      'qwen2.5-coder:7b',
      'llama3.2:1b',
      'llama3.2:3b',
      'llama3.1:8b',
      'llama3.1:70b',
      'gemma2:2b',
      'gemma2:9b',
      'gemma2:27b',
      'phi3.5:3.8b',
      'mistral:7b',
      'mistral-nemo:12b',
      'deepseek-coder-v2',
      'codellama:7b',
    ],
    defaultModel: 'qwen2.5:3b',
    hintKey: 'provider.ollamaHint',
  },
  {
    id: 'webllm',
    label: 'WebLLM (浏览器内)',
    kind: 'webllm',
    protocol: 'openai',
    defaultBaseUrl: '',
    requiresApiKey: false,
    models: [
      'Qwen2.5-0.5B-Instruct-q4f16_1-MLC',
      'Qwen2.5-1.5B-Instruct-q4f16_1-MLC',
      'Qwen2.5-3B-Instruct-q4f16_1-MLC',
      'Qwen2.5-7B-Instruct-q4f16_1-MLC',
      'Llama-3.2-1B-Instruct-q4f32_1-MLC',
      'Llama-3.2-3B-Instruct-q4f32_1-MLC',
      'Llama-3.1-8B-Instruct-q4f32_1-MLC',
      'Phi-3.5-mini-instruct-q4f16_1-MLC',
      'gemma-2-2b-it-q4f16_1-MLC',
      'gemma-2-9b-it-q4f16_1-MLC',
      'Mistral-7B-Instruct-v0.3-q4f16_1-MLC',
    ],
    defaultModel: 'Qwen2.5-0.5B-Instruct-q4f16_1-MLC',
    hintKey: 'provider.webllmHint',
  },
]

export function getProvider(id: string): ProviderDef | undefined {
  return PROVIDERS.find((p) => p.id === id)
}
