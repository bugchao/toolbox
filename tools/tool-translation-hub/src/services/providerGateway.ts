import type {
  ApiProviderId,
  LanguageCode,
  ProviderTranslateResponse,
  TranslateRequest,
  TranslationMemoryEntry,
  TranslationStudioConfig,
} from '../types'

type ProviderDefinition = {
  id: ApiProviderId
  supportsAuto: boolean
  codeMap: Partial<Record<LanguageCode, string>>
}

const API_PROVIDERS: ProviderDefinition[] = [
  {
    id: 'mymemory',
    supportsAuto: false,
    codeMap: {
      zh: 'zh-CN',
      en: 'en',
      ja: 'ja',
      ko: 'ko',
      fr: 'fr',
      de: 'de',
      es: 'es',
      ru: 'ru',
      pt: 'pt-PT',
      ar: 'ar',
      th: 'th',
      vi: 'vi',
    },
  },
  {
    id: 'libretranslate',
    supportsAuto: true,
    codeMap: {
      auto: 'auto',
      zh: 'zh',
      en: 'en',
      ja: 'ja',
      ko: 'ko',
      fr: 'fr',
      de: 'de',
      es: 'es',
      ru: 'ru',
      pt: 'pt',
      ar: 'ar',
      th: 'th',
      vi: 'vi',
    },
  },
]

function normalizeProviderLanguage(provider: ProviderDefinition, code: LanguageCode) {
  return provider.codeMap[code] ?? provider.codeMap.en ?? 'en'
}

async function translateWithMyMemory(source: string, target: string, text: string) {
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${encodeURIComponent(`${source}|${target}`)}`
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }
  const payload = await response.json()
  const translation = payload?.responseData?.translatedText
  if (typeof translation !== 'string' || !translation.trim()) {
    throw new Error('Empty translation')
  }
  return translation
}

async function translateWithLibreTranslate(endpoint: string, apiKey: string, source: string, target: string, text: string) {
  const normalizedEndpoint = endpoint.replace(/\/$/, '')
  const response = await fetch(`${normalizedEndpoint}/translate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      q: text,
      source,
      target,
      format: 'text',
      api_key: apiKey || undefined,
    }),
  })
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }
  const payload = await response.json()
  const translation = payload?.translatedText
  if (typeof translation !== 'string' || !translation.trim()) {
    throw new Error('Empty translation')
  }
  return translation
}

export function splitIntoSegments(text: string) {
  return text
    .split(/\n+/)
    .flatMap((line) => line.split(/(?<=[.!?。！？])/))
    .map((part) => part.trim())
    .filter(Boolean)
}

export function findMemoryMatch(
  memory: TranslationMemoryEntry[],
  sourceText: string,
  sourceLanguage: Exclude<LanguageCode, 'auto'>,
  targetLanguage: Exclude<LanguageCode, 'auto'>,
  style: TranslateRequest['style'],
  tone: TranslateRequest['tone']
) {
  return memory.find((entry) =>
    entry.sourceText === sourceText &&
    entry.sourceLanguage === sourceLanguage &&
    entry.targetLanguage === targetLanguage &&
    entry.style === style &&
    entry.tone === tone
  )
}

export async function translateWithProviders(
  request: TranslateRequest,
  providerIds: ApiProviderId[],
  config: TranslationStudioConfig
): Promise<ProviderTranslateResponse[]> {
  const providers = API_PROVIDERS.filter((provider) => providerIds.includes(provider.id))
  if (!providers.length) return []

  const results = await Promise.allSettled(
    providers.map(async (provider) => {
      if (provider.id === 'mymemory') {
        if (request.sourceLanguage === 'auto') {
          throw new Error('MyMemory does not support auto detection for source language')
        }
        const source = normalizeProviderLanguage(provider, request.sourceLanguage)
        const target = normalizeProviderLanguage(provider, request.targetLanguage)
        return {
          providerId: provider.id,
          translatedText: await translateWithMyMemory(source, target, request.text),
        }
      }

      if (!config.libreEndpoint.trim()) {
        throw new Error('LibreTranslate endpoint is required')
      }

      const source = request.sourceLanguage === 'auto' ? 'auto' : normalizeProviderLanguage(provider, request.sourceLanguage)
      const target = normalizeProviderLanguage(provider, request.targetLanguage)
      return {
        providerId: provider.id,
        translatedText: await translateWithLibreTranslate(
          config.libreEndpoint.trim(),
          config.libreApiKey.trim(),
          source,
          target,
          request.text
        ),
      }
    })
  )

  return results
    .filter((result): result is PromiseFulfilledResult<ProviderTranslateResponse> => result.status === 'fulfilled')
    .map((result) => result.value)
}
