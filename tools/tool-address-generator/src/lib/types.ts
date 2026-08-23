import type { Faker } from '@faker-js/faker'

export type AddressFormat =
  | 'eastAsia'
  | 'northAmerica'
  | 'british'
  | 'europe'
  | 'latinAmerica'
  | 'southAsia'
  | 'generic'

export type UiLanguage = 'zh' | 'en'
export type ResultView = 'cards' | 'singleLine' | 'json'
export type ExportFormat = 'json' | 'csv' | 'txt'

export interface CountryProfile {
  code: string
  nameZh: string
  nameEn: string
  nativeName: string
  loadFaker: () => Promise<Faker>
  locale: string
  format: AddressFormat
  hasRegion?: boolean
  hasPostalCode?: boolean
  hasSecondaryAddress?: boolean
}

export interface GeneratedAddress {
  id: string
  countryCode: string
  countryName: string
  addressLine1: string
  addressLine2?: string
  city: string
  region?: string
  postalCode?: string
  formatted: string
}

export interface GenerateAddressOptions {
  countryCode: string
  count: number
  seed?: string
  randomCountry?: boolean
  language?: UiLanguage
}
