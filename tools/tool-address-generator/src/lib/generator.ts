import { COUNTRY_PROFILES, findCountryProfile, getCountryName } from './countries'
import type { CountryProfile, GenerateAddressOptions, GeneratedAddress } from './types'

function hashText(value: string): number {
  let hash = 0x811c9dc5
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 0x01000193)
  }
  return hash >>> 0
}

export function normalizeSeed(seed: string): number {
  return hashText(seed.trim() || 'toolbox-address-generator')
}

function createEphemeralSeed(): number {
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    return crypto.getRandomValues(new Uint32Array(1))[0]
  }
  return (Date.now() ^ 0xa5a5a5a5) >>> 0
}

export function makeSeededRng(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

function nonEmpty(parts: Array<string | undefined>): string[] {
  return parts.map((part) => part?.trim()).filter((part): part is string => Boolean(part))
}

function cityRegionPostal(address: GeneratedAddress, separator = ' '): string {
  return nonEmpty([address.city, address.region, address.postalCode]).join(separator)
}

function formatAddress(profile: CountryProfile, address: GeneratedAddress): string {
  const { addressLine1, addressLine2, city, region, postalCode, countryName } = address

  switch (profile.format) {
    case 'eastAsia': {
      const location = nonEmpty([region, city, addressLine1]).join('')
      const postal = postalCode ? `${profile.code === 'JP' ? '〒' : ''}${postalCode}` : undefined
      return nonEmpty([postal, location, addressLine2, countryName]).join('\n')
    }
    case 'northAmerica':
      return nonEmpty([
        addressLine1,
        addressLine2,
        `${city}${region ? `, ${region}` : ''}${postalCode ? ` ${postalCode}` : ''}`,
        countryName,
      ]).join('\n')
    case 'british':
      return nonEmpty([addressLine1, addressLine2, city, region, postalCode, countryName]).join('\n')
    case 'europe':
      return nonEmpty([
        addressLine1,
        addressLine2,
        nonEmpty([postalCode, city]).join(' '),
        region,
        countryName,
      ]).join('\n')
    case 'latinAmerica':
      return nonEmpty([
        addressLine1,
        addressLine2,
        `${nonEmpty([postalCode, city]).join(' ')}${region ? ` - ${region}` : ''}`,
        countryName,
      ]).join('\n')
    case 'southAsia':
      return nonEmpty([addressLine1, addressLine2, city, region, postalCode, countryName]).join('\n')
    default:
      return nonEmpty([addressLine1, addressLine2, cityRegionPostal(address), countryName]).join('\n')
  }
}

async function generateOne(
  profile: CountryProfile,
  baseSeed: number,
  index: number,
  language: 'zh' | 'en',
): Promise<GeneratedAddress> {
  const profileSeed = hashText(profile.code)
  const faker = await profile.loadFaker()
  faker.seed([baseSeed, index + 1, profileSeed])

  const addressLine1 = faker.location.streetAddress()
  const secondaryCandidate = faker.location.secondaryAddress()
  const city = faker.location.city()
  const region = profile.hasRegion ? faker.location.state() : undefined
  const postalCode = profile.hasPostalCode ? faker.location.zipCode() : undefined
  const includeSecondary = profile.hasSecondaryAddress && makeSeededRng(baseSeed ^ profileSeed ^ index)() < 0.42
  const countryName = getCountryName(profile, language)

  const partial: GeneratedAddress = {
    id: `address-${profile.code.toLowerCase()}-${baseSeed.toString(36)}-${index + 1}`,
    countryCode: profile.code,
    countryName,
    addressLine1,
    addressLine2: includeSecondary ? secondaryCandidate : undefined,
    city,
    region,
    postalCode,
    formatted: '',
  }

  return { ...partial, formatted: formatAddress(profile, partial) }
}

export async function generateAddresses(options: GenerateAddressOptions): Promise<GeneratedAddress[]> {
  const language = options.language ?? 'zh'
  const count = Math.max(1, Math.min(50, Math.trunc(options.count) || 1))
  const suppliedSeed = options.seed?.trim()
  const baseSeed = suppliedSeed ? normalizeSeed(suppliedSeed) : createEphemeralSeed()
  const selectedProfile = findCountryProfile(options.countryCode) ?? COUNTRY_PROFILES[0]
  const countryRng = makeSeededRng(baseSeed ^ 0x9e3779b9)

  const generated: GeneratedAddress[] = []
  for (let index = 0; index < count; index += 1) {
    const profile = options.randomCountry
      ? COUNTRY_PROFILES[Math.floor(countryRng() * COUNTRY_PROFILES.length)]
      : selectedProfile
    // Faker locale instances are mutable (seed changes internal state), so records are
    // generated sequentially to avoid cross-record races when a profile repeats.
    generated.push(await generateOne(profile, baseSeed, index, language))
  }
  return generated
}

export function toSingleLine(address: GeneratedAddress): string {
  return address.formatted.split('\n').map((line) => line.trim()).filter(Boolean).join(', ')
}
