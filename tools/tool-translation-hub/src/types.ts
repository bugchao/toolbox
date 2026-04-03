export type LanguageCode =
  | 'auto'
  | 'zh'
  | 'en'
  | 'ja'
  | 'ko'
  | 'fr'
  | 'de'
  | 'es'
  | 'ru'
  | 'pt'
  | 'ar'
  | 'th'
  | 'vi'

export type WebProviderId = 'google' | 'bing' | 'baidu' | 'deepl'
export type ApiProviderId = 'mymemory' | 'libretranslate'
export type TranslationStyle = 'standard' | 'academic' | 'business' | 'localization' | 'technical' | 'legal'
export type TranslationTone = 'formal' | 'casual' | 'native'
export type TranslationVariant = 'literal' | 'adaptive' | 'localized'
export type StudioSection = 'main' | 'documents' | 'history' | 'glossary' | 'settings'
export type ResultState = 'idle' | 'loading' | 'ready' | 'error' | 'disabled'

export type GlossaryEntry = {
  id: string
  sourceTerm: string
  targetTerm: string
  note: string
  sourceLanguage: Exclude<LanguageCode, 'auto'>
  targetLanguage: Exclude<LanguageCode, 'auto'>
}

export type TranslationMemoryEntry = {
  id: string
  sourceText: string
  translatedText: string
  sourceLanguage: Exclude<LanguageCode, 'auto'>
  targetLanguage: Exclude<LanguageCode, 'auto'>
  style: TranslationStyle
  tone: TranslationTone
  providerId: ApiProviderId | 'memory'
  updatedAt: string
}

export type SegmentTranslation = {
  id: string
  source: string
  translations: Record<TranslationVariant, string>
  selectedVariant: TranslationVariant
  suggestions: string[]
  explanation: string[]
  providerOutputs: Partial<Record<ApiProviderId, string>>
  status: ResultState
  memoryHit?: boolean
}

export type TranslationHistoryRecord = {
  id: string
  createdAt: string
  sourceText: string
  sourceLanguage: LanguageCode
  targetLanguage: Exclude<LanguageCode, 'auto'>
  style: TranslationStyle
  tone: TranslationTone
  context: string
  favorite: boolean
  segments: SegmentTranslation[]
}

export type TranslationStudioConfig = {
  selectedApiProviders: ApiProviderId[]
  selectedWebProviders: WebProviderId[]
  enableWebWorkbench: boolean
  enableMultiView: boolean
  enableRealtime: boolean
  enableExplanations: boolean
  libreEndpoint: string
  libreApiKey: string
}

export type TranslationStudioState = {
  sourceText: string
  sourceLanguage: LanguageCode
  targetLanguage: Exclude<LanguageCode, 'auto'>
  style: TranslationStyle
  tone: TranslationTone
  context: string
  activeSection: StudioSection
  activeHistoryId: string | null
  segments: SegmentTranslation[]
  history: TranslationHistoryRecord[]
  glossary: GlossaryEntry[]
  memory: TranslationMemoryEntry[]
  config: TranslationStudioConfig
}

export type TranslateRequest = {
  text: string
  sourceLanguage: LanguageCode
  targetLanguage: Exclude<LanguageCode, 'auto'>
  style: TranslationStyle
  tone: TranslationTone
  context: string
}

export type ProviderTranslateResponse = {
  providerId: ApiProviderId
  translatedText: string
}
