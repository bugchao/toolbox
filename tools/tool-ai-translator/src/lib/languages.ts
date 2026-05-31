export type LangCode =
  | 'auto'
  | 'zh'
  | 'zh-TW'
  | 'en'
  | 'ja'
  | 'ko'
  | 'fr'
  | 'de'
  | 'es'
  | 'ru'
  | 'pt'
  | 'it'
  | 'ar'
  | 'th'
  | 'vi'

export type LangEntry = {
  code: LangCode
  /** 给提示词用的英文显示名（让 LLM 不出戏） */
  englishName: string
  /** UI 用的 i18n 键（namespace 内） */
  i18nKey: string
}

export const LANGUAGES: LangEntry[] = [
  { code: 'auto', englishName: 'auto-detected language', i18nKey: 'lang.auto' },
  { code: 'zh', englishName: 'Simplified Chinese', i18nKey: 'lang.zh' },
  { code: 'zh-TW', englishName: 'Traditional Chinese', i18nKey: 'lang.zhTW' },
  { code: 'en', englishName: 'English', i18nKey: 'lang.en' },
  { code: 'ja', englishName: 'Japanese', i18nKey: 'lang.ja' },
  { code: 'ko', englishName: 'Korean', i18nKey: 'lang.ko' },
  { code: 'fr', englishName: 'French', i18nKey: 'lang.fr' },
  { code: 'de', englishName: 'German', i18nKey: 'lang.de' },
  { code: 'es', englishName: 'Spanish', i18nKey: 'lang.es' },
  { code: 'ru', englishName: 'Russian', i18nKey: 'lang.ru' },
  { code: 'pt', englishName: 'Portuguese', i18nKey: 'lang.pt' },
  { code: 'it', englishName: 'Italian', i18nKey: 'lang.it' },
  { code: 'ar', englishName: 'Arabic', i18nKey: 'lang.ar' },
  { code: 'th', englishName: 'Thai', i18nKey: 'lang.th' },
  { code: 'vi', englishName: 'Vietnamese', i18nKey: 'lang.vi' },
]

export function getLang(code: LangCode): LangEntry {
  return LANGUAGES.find((l) => l.code === code) ?? LANGUAGES[0]
}
