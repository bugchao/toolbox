import { describe, expect, it } from 'vitest'
import { serializeAddresses } from './serialize'
import type { GeneratedAddress } from './types'

const record: GeneratedAddress = {
  id: 'address-us-1-0',
  countryCode: 'US',
  countryName: 'United States',
  addressLine1: '12 "Maple", Lane',
  addressLine2: 'Apt 4\nRear',
  city: 'New York',
  region: 'New York',
  postalCode: '10001',
  formatted: '12 "Maple", Lane\nApt 4 Rear\nNew York, NY 10001\nUnited States',
}

describe('serializeAddresses', () => {
  it('exports stable JSON', () => {
    expect(JSON.parse(serializeAddresses([record], 'json'))).toEqual([record])
  })

  it('escapes commas, quotes, newlines and unicode in CSV', () => {
    const csv = serializeAddresses([{ ...record, city: 'München' }], 'csv')
    expect(csv.split('\n')[0]).toBe(
      'id,countryCode,countryName,addressLine1,addressLine2,city,region,postalCode,formatted',
    )
    expect(csv).toContain('"12 ""Maple"", Lane"')
    expect(csv).toContain('"Apt 4\nRear"')
    expect(csv).toContain('München')
  })

  it('separates TXT address blocks without changing the formatted address', () => {
    expect(serializeAddresses([record, { ...record, id: 'second' }], 'txt')).toBe(
      `${record.formatted}\n\n${record.formatted}`,
    )
  })
})
