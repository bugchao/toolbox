import { describe, it, expect, vi } from 'vitest'
import { buildMessages, buildPrompt, readSse, translate } from './translate'

describe('buildPrompt', () => {
  it('mentions source / target English names and original text', () => {
    const p = buildPrompt('zh', 'en', '你好')
    expect(p).toContain('Simplified Chinese')
    expect(p).toContain('English')
    expect(p).toContain('你好')
    // 显式禁止"加引号 / 加解释"
    expect(p).toMatch(/no quotes/i)
  })
})

describe('buildMessages', () => {
  it('emits a [system, user] pair', () => {
    const m = buildMessages('en', 'zh', 'hello')
    expect(m).toHaveLength(2)
    expect(m[0].role).toBe('system')
    expect(m[0].content).toContain('Simplified Chinese')
    expect(m[1]).toEqual({ role: 'user', content: 'hello' })
  })
})

/** 把字符串转成单次 read 完成的 ReadableStream<Uint8Array> */
function streamFromString(s: string): ReadableStream<Uint8Array> {
  const enc = new TextEncoder().encode(s)
  return new ReadableStream({
    start(controller) {
      controller.enqueue(enc)
      controller.close()
    },
  })
}

describe('readSse', () => {
  it('extracts data lines event by event', async () => {
    const sse = 'data: {"choices":[{"delta":{"content":"He"}}]}\n\ndata: {"choices":[{"delta":{"content":"llo"}}]}\n\n'
    const reader = streamFromString(sse).getReader()
    const events: string[] = []
    await readSse(reader, (d) => events.push(d))
    expect(events).toHaveLength(2)
    expect(events[0]).toContain('"He"')
  })
})

describe('translate – OpenAI protocol', () => {
  it('POSTs to /chat/completions with bearer + stream=true and accumulates content', async () => {
    const fetchFn = vi.fn(async (url: RequestInfo | URL, init?: RequestInit) => {
      expect(String(url)).toContain('/chat/completions')
      const headers = init?.headers as Record<string, string>
      expect(headers['Authorization']).toBe('Bearer sk-test')
      expect(headers['Content-Type']).toBe('application/json')
      const body = JSON.parse(String(init?.body))
      expect(body.stream).toBe(true)
      expect(body.model).toBe('gpt-4o-mini')
      expect(Array.isArray(body.messages)).toBe(true)
      return new Response(
        streamFromString(
          [
            'data: {"choices":[{"delta":{"content":"你"}}]}',
            'data: {"choices":[{"delta":{"content":"好"}}]}',
            'data: [DONE]',
          ].join('\n\n') + '\n\n',
        ),
        { status: 200, headers: { 'Content-Type': 'text/event-stream' } },
      )
    })

    const chunks: string[] = []
    const result = await translate({
      providerId: 'openai',
      model: 'gpt-4o-mini',
      apiKey: 'sk-test',
      source: 'en',
      target: 'zh',
      text: 'hello',
      onChunk: (c) => chunks.push(c),
      fetchFn: fetchFn as unknown as typeof fetch,
    })

    expect(result).toBe('你好')
    expect(chunks).toEqual(['你', '好'])
  })

  it('rejects when apiKey is missing on a cloud provider', async () => {
    await expect(
      translate({
        providerId: 'openai',
        source: 'en',
        target: 'zh',
        text: 'x',
        fetchFn: vi.fn() as unknown as typeof fetch,
      }),
    ).rejects.toThrow(/missing_api_key/)
  })
})

describe('translate – Anthropic protocol', () => {
  it('POSTs to /messages with anthropic headers, splits system from user', async () => {
    const fetchFn = vi.fn(async (url: RequestInfo | URL, init?: RequestInit) => {
      expect(String(url)).toContain('/messages')
      const headers = init?.headers as Record<string, string>
      expect(headers['x-api-key']).toBe('ant-test')
      expect(headers['anthropic-version']).toBe('2023-06-01')
      const body = JSON.parse(String(init?.body))
      expect(typeof body.system).toBe('string')
      expect(body.messages[0].role).toBe('user')
      expect(body.stream).toBe(true)
      return new Response(
        streamFromString(
          [
            'data: {"type":"content_block_delta","delta":{"text":"Hi"}}',
            'data: {"type":"content_block_delta","delta":{"text":" there"}}',
          ].join('\n\n') + '\n\n',
        ),
        { status: 200 },
      )
    })

    const result = await translate({
      providerId: 'anthropic',
      model: 'claude-haiku-4-5',
      apiKey: 'ant-test',
      source: 'zh',
      target: 'en',
      text: '你好',
      fetchFn: fetchFn as unknown as typeof fetch,
    })

    expect(result).toBe('Hi there')
  })
})

describe('translate – Gemini protocol', () => {
  it('puts key in query string and emits text from candidates parts', async () => {
    const fetchFn = vi.fn(async (url: RequestInfo | URL) => {
      expect(String(url)).toContain('streamGenerateContent')
      expect(String(url)).toContain('alt=sse')
      expect(String(url)).toContain('key=g-test')
      return new Response(
        streamFromString(
          'data: {"candidates":[{"content":{"parts":[{"text":"Bonjour"}]}}]}\n\n',
        ),
        { status: 200 },
      )
    })
    const result = await translate({
      providerId: 'gemini',
      model: 'gemini-2.0-flash',
      apiKey: 'g-test',
      source: 'en',
      target: 'fr',
      text: 'hello',
      fetchFn: fetchFn as unknown as typeof fetch,
    })
    expect(result).toBe('Bonjour')
  })
})

describe('translate – Ollama protocol', () => {
  it('translates "model not found" 404 into ollama_model_not_found:<model>', async () => {
    const fetchFn = vi.fn(async () =>
      new Response(
        JSON.stringify({ error: "model 'qwen2.5:3b' not found, try pulling it first" }),
        { status: 404, headers: { 'Content-Type': 'application/json' } },
      ),
    )
    await expect(translate({
      providerId: 'ollama',
      model: 'qwen2.5:3b',
      source: 'en',
      target: 'zh',
      text: 'hi',
      fetchFn: fetchFn as unknown as typeof fetch,
    })).rejects.toThrow(/^ollama_model_not_found:qwen2\.5:3b$/)
  })

  it('surfaces Ollama error body for non-404 failures', async () => {
    const fetchFn = vi.fn(async () =>
      new Response(JSON.stringify({ error: 'bad request' }), { status: 400 }),
    )
    await expect(translate({
      providerId: 'ollama',
      model: 'qwen2.5:3b',
      source: 'en',
      target: 'zh',
      text: 'hi',
      fetchFn: fetchFn as unknown as typeof fetch,
    })).rejects.toThrow(/Ollama HTTP 400.*bad request/)
  })

  it('POSTs to /api/chat and concatenates ndjson chunks until done=true', async () => {
    const fetchFn = vi.fn(async (url: RequestInfo | URL) => {
      expect(String(url)).toContain('/api/chat')
      const body = [
        '{"message":{"content":"こん"},"done":false}',
        '{"message":{"content":"にちは"},"done":false}',
        '{"message":{"content":""},"done":true}',
      ].join('\n')
      return new Response(streamFromString(body + '\n'), { status: 200 })
    })
    const result = await translate({
      providerId: 'ollama',
      model: 'qwen2.5:3b',
      source: 'en',
      target: 'ja',
      text: 'hi',
      fetchFn: fetchFn as unknown as typeof fetch,
    })
    expect(result).toBe('こんにちは')
  })
})

describe('translate – WebLLM injection', () => {
  it('consumes the webllmStream async generator', async () => {
    const webllmStream = async function* () {
      yield '안'
      yield '녕'
    }
    const result = await translate({
      providerId: 'webllm',
      model: 'Qwen2.5-0.5B-Instruct-q4f16_1-MLC',
      source: 'en',
      target: 'ko',
      text: 'hi',
      webllmStream,
    })
    expect(result).toBe('안녕')
  })
})
