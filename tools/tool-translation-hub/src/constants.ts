import type { ApiProviderId, LanguageCode, StudioSection, TranslationStyle, TranslationTone, TranslationStudioConfig, TranslationStudioState, TranslationVariant, WebProviderId } from './types'

export const STORAGE_NAMESPACE = 'translation-hub'
export const STORAGE_KEY = 'studio'

export const LANGUAGES: LanguageCode[] = ['auto', 'zh', 'en', 'ja', 'ko', 'fr', 'de', 'es', 'ru', 'pt', 'ar', 'th', 'vi']
export const STYLES: TranslationStyle[] = ['standard', 'academic', 'business', 'localization', 'technical', 'legal']
export const TONES: TranslationTone[] = ['formal', 'casual', 'native']
export const VARIANTS: TranslationVariant[] = ['literal', 'adaptive', 'localized']
export const STUDIO_SECTIONS: StudioSection[] = ['main', 'documents', 'history', 'glossary', 'settings']
export const API_PROVIDER_IDS: ApiProviderId[] = ['mymemory', 'libretranslate']
export const WEB_PROVIDER_IDS: WebProviderId[] = ['google', 'bing', 'baidu', 'deepl']

export const DEFAULT_CONFIG: TranslationStudioConfig = {
  selectedApiProviders: ['mymemory'],
  selectedWebProviders: ['google', 'bing', 'baidu'],
  enableWebWorkbench: true,
  enableMultiView: true,
  enableRealtime: true,
  enableExplanations: true,
  libreEndpoint: '',
  libreApiKey: '',
}

export const DEFAULT_STATE: TranslationStudioState = {
  sourceText: '你好，欢迎来到 AI 翻译工作台。',
  sourceLanguage: 'zh',
  targetLanguage: 'en',
  style: 'standard',
  tone: 'native',
  context: '',
  activeSection: 'main',
  activeHistoryId: null,
  segments: [],
  history: [],
  glossary: [],
  memory: [],
  config: DEFAULT_CONFIG,
}
