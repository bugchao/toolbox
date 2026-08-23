import type { Faker } from '@faker-js/faker'
import type { AddressFormat, CountryProfile } from './types'

type FakerModule = { faker: Faker }

function localeLoader(loader: () => Promise<FakerModule>): () => Promise<Faker> {
  let cached: Promise<Faker> | undefined
  return () => {
    cached ??= loader().then((module) => module.faker)
    return cached
  }
}

// Explicit dynamic imports keep country data in small on-demand chunks instead of adding
// every Faker locale to the address generator's initial route bundle.
const fakerAF_ZA = localeLoader(() => import('@faker-js/faker/locale/af_ZA'))
const fakerAR = localeLoader(() => import('@faker-js/faker/locale/ar'))
const fakerAZ = localeLoader(() => import('@faker-js/faker/locale/az'))
const fakerBN_BD = localeLoader(() => import('@faker-js/faker/locale/bn_BD'))
const fakerCS_CZ = localeLoader(() => import('@faker-js/faker/locale/cs_CZ'))
const fakerDA = localeLoader(() => import('@faker-js/faker/locale/da'))
const fakerDE = localeLoader(() => import('@faker-js/faker/locale/de'))
const fakerDE_AT = localeLoader(() => import('@faker-js/faker/locale/de_AT'))
const fakerDE_CH = localeLoader(() => import('@faker-js/faker/locale/de_CH'))
const fakerDV = localeLoader(() => import('@faker-js/faker/locale/dv'))
const fakerEL = localeLoader(() => import('@faker-js/faker/locale/el'))
const fakerEN_AU = localeLoader(() => import('@faker-js/faker/locale/en_AU'))
const fakerEN_CA = localeLoader(() => import('@faker-js/faker/locale/en_CA'))
const fakerEN_GB = localeLoader(() => import('@faker-js/faker/locale/en_GB'))
const fakerEN_GH = localeLoader(() => import('@faker-js/faker/locale/en_GH'))
const fakerEN_HK = localeLoader(() => import('@faker-js/faker/locale/en_HK'))
const fakerEN_IE = localeLoader(() => import('@faker-js/faker/locale/en_IE'))
const fakerEN_IN = localeLoader(() => import('@faker-js/faker/locale/en_IN'))
const fakerEN_NG = localeLoader(() => import('@faker-js/faker/locale/en_NG'))
const fakerEN_US = localeLoader(() => import('@faker-js/faker/locale/en_US'))
const fakerES = localeLoader(() => import('@faker-js/faker/locale/es'))
const fakerES_MX = localeLoader(() => import('@faker-js/faker/locale/es_MX'))
const fakerFA = localeLoader(() => import('@faker-js/faker/locale/fa'))
const fakerFI = localeLoader(() => import('@faker-js/faker/locale/fi'))
const fakerFR = localeLoader(() => import('@faker-js/faker/locale/fr'))
const fakerFR_BE = localeLoader(() => import('@faker-js/faker/locale/fr_BE'))
const fakerFR_LU = localeLoader(() => import('@faker-js/faker/locale/fr_LU'))
const fakerFR_SN = localeLoader(() => import('@faker-js/faker/locale/fr_SN'))
const fakerHE = localeLoader(() => import('@faker-js/faker/locale/he'))
const fakerHR = localeLoader(() => import('@faker-js/faker/locale/hr'))
const fakerHU = localeLoader(() => import('@faker-js/faker/locale/hu'))
const fakerHY = localeLoader(() => import('@faker-js/faker/locale/hy'))
const fakerID_ID = localeLoader(() => import('@faker-js/faker/locale/id_ID'))
const fakerIT = localeLoader(() => import('@faker-js/faker/locale/it'))
const fakerJA = localeLoader(() => import('@faker-js/faker/locale/ja'))
const fakerKA_GE = localeLoader(() => import('@faker-js/faker/locale/ka_GE'))
const fakerKO = localeLoader(() => import('@faker-js/faker/locale/ko'))
const fakerLV = localeLoader(() => import('@faker-js/faker/locale/lv'))
const fakerMK = localeLoader(() => import('@faker-js/faker/locale/mk'))
const fakerNB_NO = localeLoader(() => import('@faker-js/faker/locale/nb_NO'))
const fakerNE = localeLoader(() => import('@faker-js/faker/locale/ne'))
const fakerNL = localeLoader(() => import('@faker-js/faker/locale/nl'))
const fakerPL = localeLoader(() => import('@faker-js/faker/locale/pl'))
const fakerPT_BR = localeLoader(() => import('@faker-js/faker/locale/pt_BR'))
const fakerPT_PT = localeLoader(() => import('@faker-js/faker/locale/pt_PT'))
const fakerRO = localeLoader(() => import('@faker-js/faker/locale/ro'))
const fakerRO_MD = localeLoader(() => import('@faker-js/faker/locale/ro_MD'))
const fakerRU = localeLoader(() => import('@faker-js/faker/locale/ru'))
const fakerSK = localeLoader(() => import('@faker-js/faker/locale/sk'))
const fakerSR_RS_latin = localeLoader(() => import('@faker-js/faker/locale/sr_RS_latin'))
const fakerSV = localeLoader(() => import('@faker-js/faker/locale/sv'))
const fakerTH = localeLoader(() => import('@faker-js/faker/locale/th'))
const fakerTR = localeLoader(() => import('@faker-js/faker/locale/tr'))
const fakerUK = localeLoader(() => import('@faker-js/faker/locale/uk'))
const fakerUR = localeLoader(() => import('@faker-js/faker/locale/ur'))
const fakerUZ_UZ_latin = localeLoader(() => import('@faker-js/faker/locale/uz_UZ_latin'))
const fakerVI = localeLoader(() => import('@faker-js/faker/locale/vi'))
const fakerZH_CN = localeLoader(() => import('@faker-js/faker/locale/zh_CN'))
const fakerZH_TW = localeLoader(() => import('@faker-js/faker/locale/zh_TW'))

type ProfileOptions = {
  format?: AddressFormat
  hasRegion?: boolean
  hasPostalCode?: boolean
  hasSecondaryAddress?: boolean
}

function profile(
  code: string,
  nameZh: string,
  nameEn: string,
  nativeName: string,
  locale: string,
  loadFaker: () => Promise<Faker>,
  options: ProfileOptions = {},
): CountryProfile {
  return {
    code,
    nameZh,
    nameEn,
    nativeName,
    locale,
    loadFaker,
    format: options.format ?? 'generic',
    hasRegion: options.hasRegion ?? false,
    hasPostalCode: options.hasPostalCode ?? true,
    hasSecondaryAddress: options.hasSecondaryAddress ?? false,
  }
}

// Only expose profiles backed by a Faker v9 locale with usable location data.
// A locale makes the values format-aware; it does not make the assembled address deliverable.
export const COUNTRY_PROFILES: CountryProfile[] = [
  profile('AM', '亚美尼亚', 'Armenia', 'Հայաստան', 'hy', fakerHY, { format: 'europe' }),
  profile('AU', '澳大利亚', 'Australia', 'Australia', 'en_AU', fakerEN_AU, { format: 'british', hasRegion: true, hasSecondaryAddress: true }),
  profile('AT', '奥地利', 'Austria', 'Österreich', 'de_AT', fakerDE_AT, { format: 'europe' }),
  profile('AZ', '阿塞拜疆', 'Azerbaijan', 'Azərbaycan', 'az', fakerAZ, { format: 'europe' }),
  profile('BD', '孟加拉国', 'Bangladesh', 'বাংলাদেশ', 'bn_BD', fakerBN_BD, { format: 'southAsia', hasRegion: true }),
  profile('BE', '比利时', 'Belgium', 'Belgique / België', 'fr_BE', fakerFR_BE, { format: 'europe' }),
  profile('BR', '巴西', 'Brazil', 'Brasil', 'pt_BR', fakerPT_BR, { format: 'latinAmerica', hasRegion: true, hasSecondaryAddress: true }),
  profile('CA', '加拿大', 'Canada', 'Canada', 'en_CA', fakerEN_CA, { format: 'northAmerica', hasRegion: true, hasSecondaryAddress: true }),
  profile('CN', '中国', 'China', '中国', 'zh_CN', fakerZH_CN, { format: 'eastAsia', hasRegion: true }),
  profile('HR', '克罗地亚', 'Croatia', 'Hrvatska', 'hr', fakerHR, { format: 'europe' }),
  profile('CZ', '捷克', 'Czechia', 'Česko', 'cs_CZ', fakerCS_CZ, { format: 'europe' }),
  profile('DK', '丹麦', 'Denmark', 'Danmark', 'da', fakerDA, { format: 'europe' }),
  profile('FI', '芬兰', 'Finland', 'Suomi', 'fi', fakerFI, { format: 'europe' }),
  profile('FR', '法国', 'France', 'France', 'fr', fakerFR, { format: 'europe' }),
  profile('GE', '格鲁吉亚', 'Georgia', 'საქართველო', 'ka_GE', fakerKA_GE, { format: 'europe' }),
  profile('DE', '德国', 'Germany', 'Deutschland', 'de', fakerDE, { format: 'europe' }),
  profile('GH', '加纳', 'Ghana', 'Ghana', 'en_GH', fakerEN_GH, { format: 'british', hasRegion: true }),
  profile('GR', '希腊', 'Greece', 'Ελλάδα', 'el', fakerEL, { format: 'europe' }),
  profile('HK', '中国香港', 'Hong Kong', '香港', 'en_HK', fakerEN_HK, { format: 'eastAsia', hasRegion: true, hasPostalCode: false }),
  profile('HU', '匈牙利', 'Hungary', 'Magyarország', 'hu', fakerHU, { format: 'europe' }),
  profile('IN', '印度', 'India', 'भारत', 'en_IN', fakerEN_IN, { format: 'southAsia', hasRegion: true, hasSecondaryAddress: true }),
  profile('ID', '印度尼西亚', 'Indonesia', 'Indonesia', 'id_ID', fakerID_ID, { format: 'southAsia', hasRegion: true }),
  profile('IR', '伊朗', 'Iran', 'ایران', 'fa', fakerFA, { hasRegion: true }),
  profile('IE', '爱尔兰', 'Ireland', 'Éire', 'en_IE', fakerEN_IE, { format: 'british', hasRegion: true }),
  profile('IL', '以色列', 'Israel', 'ישראל', 'he', fakerHE, { hasRegion: true }),
  profile('IT', '意大利', 'Italy', 'Italia', 'it', fakerIT, { format: 'europe' }),
  profile('JP', '日本', 'Japan', '日本', 'ja', fakerJA, { format: 'eastAsia', hasRegion: true }),
  profile('KR', '韩国', 'South Korea', '대한민국', 'ko', fakerKO, { format: 'eastAsia', hasRegion: true }),
  profile('LV', '拉脱维亚', 'Latvia', 'Latvija', 'lv', fakerLV, { format: 'europe' }),
  profile('LU', '卢森堡', 'Luxembourg', 'Lëtzebuerg', 'fr_LU', fakerFR_LU, { format: 'europe' }),
  profile('MV', '马尔代夫', 'Maldives', 'ދިވެހިރާއްޖެ', 'dv', fakerDV, { format: 'southAsia', hasPostalCode: false }),
  profile('MX', '墨西哥', 'Mexico', 'México', 'es_MX', fakerES_MX, { format: 'latinAmerica', hasRegion: true }),
  profile('MD', '摩尔多瓦', 'Moldova', 'Moldova', 'ro_MD', fakerRO_MD, { format: 'europe' }),
  profile('NL', '荷兰', 'Netherlands', 'Nederland', 'nl', fakerNL, { format: 'europe' }),
  profile('NP', '尼泊尔', 'Nepal', 'नेपाल', 'ne', fakerNE, { format: 'southAsia', hasRegion: true }),
  profile('NG', '尼日利亚', 'Nigeria', 'Nigeria', 'en_NG', fakerEN_NG, { format: 'british', hasRegion: true }),
  profile('MK', '北马其顿', 'North Macedonia', 'Северна Македонија', 'mk', fakerMK, { format: 'europe' }),
  profile('NO', '挪威', 'Norway', 'Norge', 'nb_NO', fakerNB_NO, { format: 'europe' }),
  profile('PK', '巴基斯坦', 'Pakistan', 'پاکستان', 'ur', fakerUR, { format: 'southAsia', hasRegion: true }),
  profile('PL', '波兰', 'Poland', 'Polska', 'pl', fakerPL, { format: 'europe' }),
  profile('PT', '葡萄牙', 'Portugal', 'Portugal', 'pt_PT', fakerPT_PT, { format: 'europe' }),
  profile('RO', '罗马尼亚', 'Romania', 'România', 'ro', fakerRO, { format: 'europe' }),
  profile('RU', '俄罗斯', 'Russia', 'Россия', 'ru', fakerRU, { format: 'europe', hasRegion: true }),
  profile('SA', '沙特阿拉伯', 'Saudi Arabia', 'المملكة العربية السعودية', 'ar', fakerAR, { hasRegion: true }),
  profile('SN', '塞内加尔', 'Senegal', 'Sénégal', 'fr_SN', fakerFR_SN, { hasRegion: true }),
  profile('RS', '塞尔维亚', 'Serbia', 'Srbija', 'sr_RS_latin', fakerSR_RS_latin, { format: 'europe' }),
  profile('SK', '斯洛伐克', 'Slovakia', 'Slovensko', 'sk', fakerSK, { format: 'europe' }),
  profile('ZA', '南非', 'South Africa', 'South Africa', 'af_ZA', fakerAF_ZA, { format: 'british', hasRegion: true }),
  profile('ES', '西班牙', 'Spain', 'España', 'es', fakerES, { format: 'europe' }),
  profile('SE', '瑞典', 'Sweden', 'Sverige', 'sv', fakerSV, { format: 'europe' }),
  profile('CH', '瑞士', 'Switzerland', 'Schweiz', 'de_CH', fakerDE_CH, { format: 'europe' }),
  profile('TW', '中国台湾', 'Taiwan', '臺灣', 'zh_TW', fakerZH_TW, { format: 'eastAsia', hasRegion: true }),
  profile('TH', '泰国', 'Thailand', 'ประเทศไทย', 'th', fakerTH, { hasRegion: true }),
  profile('TR', '土耳其', 'Türkiye', 'Türkiye', 'tr', fakerTR, { format: 'europe', hasRegion: true }),
  profile('UA', '乌克兰', 'Ukraine', 'Україна', 'uk', fakerUK, { format: 'europe', hasRegion: true }),
  profile('GB', '英国', 'United Kingdom', 'United Kingdom', 'en_GB', fakerEN_GB, { format: 'british', hasRegion: true, hasSecondaryAddress: true }),
  profile('US', '美国', 'United States', 'United States', 'en_US', fakerEN_US, { format: 'northAmerica', hasRegion: true, hasSecondaryAddress: true }),
  profile('UZ', '乌兹别克斯坦', 'Uzbekistan', 'Oʻzbekiston', 'uz_UZ_latin', fakerUZ_UZ_latin, { hasRegion: true }),
  profile('VN', '越南', 'Vietnam', 'Việt Nam', 'vi', fakerVI, { hasRegion: true }),
]

export function findCountryProfile(code: string): CountryProfile | undefined {
  return COUNTRY_PROFILES.find((item) => item.code === code.toUpperCase())
}

export function getDefaultCountryCode(language?: string): 'CN' | 'US' {
  return language?.toLowerCase().startsWith('zh') ? 'CN' : 'US'
}

export function getCountryName(profile: CountryProfile, language: 'zh' | 'en'): string {
  return language === 'zh' ? profile.nameZh : profile.nameEn
}

export function countryCodeToFlag(code: string): string {
  return [...code.toUpperCase()]
    .map((character) => String.fromCodePoint(127397 + character.charCodeAt(0)))
    .join('')
}
