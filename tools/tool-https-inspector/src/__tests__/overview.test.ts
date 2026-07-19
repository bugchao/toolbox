import { describe, it, expect } from 'vitest'
import { pickGeoFields } from '../../server/checks/overview.js'

describe('pickGeoFields', () => {
  it('extracts known fields on success', () => {
    const geo = pickGeoFields({
      status: 'success',
      country: 'United States',
      countryCode: 'US',
      regionName: 'Virginia',
      city: 'Ashburn',
      isp: 'Amazon',
    })
    expect(geo).toEqual({
      country: 'United States',
      countryCode: 'US',
      regionName: 'Virginia',
      city: 'Ashburn',
      isp: 'Amazon',
    })
  })

  it('returns null on failed lookup', () => {
    expect(pickGeoFields({ status: 'fail', message: 'private range' })).toBeNull()
  })

  it('returns null on missing data', () => {
    expect(pickGeoFields(null)).toBeNull()
  })
})
