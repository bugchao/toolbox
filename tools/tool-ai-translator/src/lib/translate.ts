/**
 * 统一翻译入口 —— 把 prompt 喂给不同协议的 provider，流式回吐文本块。
 *
 * 测试可注入 `fetchFn` / `webllmStream` 来 mock 网络与 WebLLM。
 */
import { getLang, type LangCode } from './languages'
import { getProvider, type Protocol, type ProviderDef } from './providers'

export type TranslateParams = {
  providerId: string
  /** 选定模型；空则用 provider 默认模型 */
  model?: string
  /** baseUrl 覆盖（用户设置） */
  baseUrl?: string
  apiKey?: string
  source: LangCode
  target: LangCode
  text: string
  /** 已格式化的术语表片段（来自 glossary.formatPromptInjection），非空时注入系统消息。 */
  glossary?: string
  /** 让用户能取消 */
  signal?: AbortSignal
  /** 每个 chunk（已是新增的增量文本）触发 */
  onChunk?: (chunk: string) => void
  /** 注入点：测试和 WebLLM 模式使用 */
  fetchFn?: typeof fetch
  /** 注入点：WebLLM 引擎流式生成器 */
  webllmStream?: (input: { model: string; messages: { role: string; content: string }[]; signal?: AbortSignal }) => AsyncIterable<string>
}

export function buildPrompt(source: LangCode, target: LangCode, text: string): string {
  const src = getLang(source).englishName
  const tgt = getLang(target).englishName
  return [
    `You are a professional translator. Translate the following text from ${src} to ${tgt}.`,
    'Output only the translated text. No explanations, no preface, no quotes around the answer.',
    'Preserve original line breaks, lists, code blocks and inline punctuation. If the input is already in the target language, return it unchanged.',
    '',
    'Text:',
    text,
  ].join('\n')
}

export type ChatMessages = { role: 'system' | 'user'; content: string }[]

export type BuildMessagesOptions = {
  /** 已经格式化好的术语表片段；非空时附加到系统消息末尾。 */
  glossary?: string
}

export function buildMessages(
  source: LangCode,
  target: LangCode,
  text: string,
  options: BuildMessagesOptions = {},
): ChatMessages {
  const src = getLang(source).englishName
  const tgt = getLang(target).englishName
  const sysParts = [
    `You are a professional translator. Translate from ${src} to ${tgt}. Output only the translated text — no preface, no quotes, no explanations. Preserve line breaks, lists, code blocks and inline punctuation.`,
  ]
  if (options.glossary && options.glossary.trim()) {
    sysParts.push('', options.glossary.trim())
  }
  return [
    { role: 'system', content: sysParts.join('\n') },
    { role: 'user', content: text },
  ]
}

/** SSE 解析器：逐字节累积、按双换行切事件。回调每个 data 字段的内容。 */
export async function readSse(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  onData: (data: string) => void,
  signal?: AbortSignal,
): Promise<void> {
  const decoder = new TextDecoder()
  let buf = ''
  while (true) {
    if (signal?.aborted) throw signal.reason ?? new Error('aborted')
    const { value, done } = await reader.read()
    if (done) break
    buf += decoder.decode(value, { stream: true })
    let idx: number
    while ((idx = buf.indexOf('\n\n')) !== -1) {
      const ev = buf.slice(0, idx)
      buf = buf.slice(idx + 2)
      for (const line of ev.split('\n')) {
        if (line.startsWith('data:')) onData(line.slice(5).trimStart())
      }
    }
  }
}

/** 协议适配：返回 (url, init, parseChunk) 三元组——parseChunk 把单个 SSE data 解析成增量文本。 */
type Adapter = {
  url: string
  init: RequestInit
  /** 返回 null 表示这个事件不携带文本（保活、done 等） */
  parseChunk: (data: string) => string | null
}

function adaptOpenAi(p: ProviderDef, baseUrl: string, apiKey: string, model: string, messages: ChatMessages): Adapter {
  return {
    url: `${baseUrl.replace(/\/$/, '')}/chat/completions`,
    init: {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ model, messages, stream: true, temperature: 0.3 }),
    },
    parseChunk: (data) => {
      if (data === '[DONE]') return null
      try {
        const j = JSON.parse(data)
        return j?.choices?.[0]?.delta?.content ?? null
      } catch {
        return null
      }
    },
  }
}

function adaptAnthropic(_p: ProviderDef, baseUrl: string, apiKey: string, model: string, messages: ChatMessages): Adapter {
  const system = messages.find((m) => m.role === 'system')?.content
  const userMessages = messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({ role: 'user' as const, content: m.content }))
  return {
    url: `${baseUrl.replace(/\/$/, '')}/messages`,
    init: {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model,
        max_tokens: 2048,
        stream: true,
        system,
        messages: userMessages,
      }),
    },
    parseChunk: (data) => {
      try {
        const j = JSON.parse(data)
        if (j?.type === 'content_block_delta') {
          return j?.delta?.text ?? null
        }
        return null
      } catch {
        return null
      }
    },
  }
}

function adaptGemini(_p: ProviderDef, baseUrl: string, apiKey: string, model: string, messages: ChatMessages): Adapter {
  const system = messages.find((m) => m.role === 'system')?.content
  const user = messages.find((m) => m.role === 'user')?.content ?? ''
  const url = `${baseUrl.replace(/\/$/, '')}/models/${model}:streamGenerateContent?alt=sse&key=${encodeURIComponent(apiKey)}`
  return {
    url,
    init: {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: user }] }],
        systemInstruction: system ? { parts: [{ text: system }] } : undefined,
        generationConfig: { temperature: 0.3 },
      }),
    },
    parseChunk: (data) => {
      try {
        const j = JSON.parse(data)
        const parts = j?.candidates?.[0]?.content?.parts
        if (!parts) return null
        return parts.map((p: { text?: string }) => p.text ?? '').join('') || null
      } catch {
        return null
      }
    },
  }
}

/** Ollama 不是 SSE，是按行 JSON 流。单独处理。 */
async function streamOllama(
  baseUrl: string,
  model: string,
  messages: ChatMessages,
  onChunk: (s: string) => void,
  signal: AbortSignal | undefined,
  fetchFn: typeof fetch,
): Promise<void> {
  const res = await fetchFn(`${baseUrl.replace(/\/$/, '')}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, messages, stream: true }),
    signal,
  })
  if (!res.ok || !res.body) {
    // Ollama 返回的 JSON 错误体形如 {"error": "model 'qwen2.5:3b' not found, try pulling it first"}
    let detail = ''
    try {
      const cloned = res.clone()
      const j = await cloned.json()
      detail = typeof j?.error === 'string' ? j.error : ''
    } catch {
      detail = (await res.text().catch(() => '')).slice(0, 200)
    }
    if (res.status === 404 && /not found|try pulling/i.test(detail)) {
      throw new Error(`ollama_model_not_found:${model}`)
    }
    throw new Error(`Ollama HTTP ${res.status}${detail ? `: ${detail}` : ''}`)
  }
  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buf = ''
  while (true) {
    if (signal?.aborted) throw signal.reason ?? new Error('aborted')
    const { value, done } = await reader.read()
    if (done) break
    buf += decoder.decode(value, { stream: true })
    let nl: number
    while ((nl = buf.indexOf('\n')) !== -1) {
      const line = buf.slice(0, nl).trim()
      buf = buf.slice(nl + 1)
      if (!line) continue
      try {
        const j = JSON.parse(line)
        const piece = j?.message?.content
        if (piece) onChunk(piece)
        if (j?.done) return
      } catch {
        /* skip bad line */
      }
    }
  }
}

/** WebLLM 走调用方注入的 async generator。 */
async function streamWebLlm(
  model: string,
  messages: ChatMessages,
  onChunk: (s: string) => void,
  signal: AbortSignal | undefined,
  webllmStream: NonNullable<TranslateParams['webllmStream']>,
): Promise<void> {
  for await (const piece of webllmStream({ model, messages, signal })) {
    if (signal?.aborted) throw signal.reason ?? new Error('aborted')
    if (piece) onChunk(piece)
  }
}

export async function translate(params: TranslateParams): Promise<string> {
  const provider = getProvider(params.providerId)
  if (!provider) throw new Error(`Unknown provider: ${params.providerId}`)

  const messages = buildMessages(params.source, params.target, params.text, {
    glossary: params.glossary,
  })
  const baseUrl = (params.baseUrl ?? provider.defaultBaseUrl).trim()
  const model = (params.model ?? provider.defaultModel).trim()
  const apiKey = (params.apiKey ?? '').trim()
  const fetchFn = params.fetchFn ?? fetch
  const onChunk = (s: string) => params.onChunk?.(s)
  let acc = ''

  // 校验
  if (provider.requiresApiKey && !apiKey) throw new Error('missing_api_key')
  if (!model) throw new Error('missing_model')
  if (provider.kind !== 'webllm' && !baseUrl) throw new Error('missing_base_url')

  // WebLLM
  if (provider.kind === 'webllm') {
    if (!params.webllmStream) throw new Error('webllm_not_initialized')
    await streamWebLlm(model, messages, (p) => { acc += p; onChunk(p) }, params.signal, params.webllmStream)
    return acc
  }

  // Ollama（独立 JSONL 流）
  if (provider.protocol === 'ollama') {
    await streamOllama(baseUrl, model, messages, (p) => { acc += p; onChunk(p) }, params.signal, fetchFn)
    return acc
  }

  // OpenAI / Anthropic / Gemini —— SSE 路径
  const adapter = buildAdapter(provider.protocol, provider, baseUrl, apiKey, model, messages)
  const res = await fetchFn(adapter.url, { ...adapter.init, signal: params.signal })
  if (!res.ok || !res.body) {
    const errText = await res.text().catch(() => '')
    throw new Error(`HTTP ${res.status} ${errText.slice(0, 200)}`)
  }
  const reader = res.body.getReader()
  await readSse(reader, (data) => {
    const piece = adapter.parseChunk(data)
    if (piece) { acc += piece; onChunk(piece) }
  }, params.signal)
  return acc
}

function buildAdapter(
  protocol: Protocol,
  provider: ProviderDef,
  baseUrl: string,
  apiKey: string,
  model: string,
  messages: ChatMessages,
): Adapter {
  switch (protocol) {
    case 'openai': return adaptOpenAi(provider, baseUrl, apiKey, model, messages)
    case 'anthropic': return adaptAnthropic(provider, baseUrl, apiKey, model, messages)
    case 'gemini': return adaptGemini(provider, baseUrl, apiKey, model, messages)
    default: throw new Error(`Protocol ${protocol} not handled by buildAdapter`)
  }
}

export const __testing = { adaptOpenAi, adaptAnthropic, adaptGemini }
