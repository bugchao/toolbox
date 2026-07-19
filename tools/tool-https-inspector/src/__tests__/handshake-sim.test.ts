import { describe, it, expect } from 'vitest'
import { CLIENT_PROFILES } from '../../server/checks/handshake-sim.js'

describe('CLIENT_PROFILES', () => {
  it('has at least 12 profiles', () => {
    expect(CLIENT_PROFILES.length).toBeGreaterThanOrEqual(12)
  })

  it('every profile has complete fields', () => {
    for (const profile of CLIENT_PROFILES) {
      expect(profile.id).toBeTruthy()
      expect(profile.label).toBeTruthy()
      expect(profile.minVersion).toBeTruthy()
      expect(profile.maxVersion).toBeTruthy()
      expect(profile.ciphers).toBeTruthy()
    }
  })

  it('has unique ids', () => {
    const ids = CLIENT_PROFILES.map((p) => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
