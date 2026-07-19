import { describe, it, expect } from 'vitest'
import { inferCompatibility } from '../../server/checks/cert-compat.js'

describe('inferCompatibility', () => {
  it('trusts a modern cert (ISRG Root X1, SHA256, RSA 2048) on all platforms except a caveat on Android', () => {
    const { platforms, baseline } = inferCompatibility({ rootCA: "Internet Security Research Group", sigAlg: 'sha256WithRSAEncryption', keyBits: 2048 })
    expect(baseline).toBe('trusted')
    const android = platforms.find((p) => p.id === 'android')
    expect(android?.status).toBe('unknown')
    expect(android?.reasons.join()).toMatch(/交叉签名/)
    const ios = platforms.find((p) => p.id === 'ios')
    expect(ios?.status).toBe('trusted')
  })

  it('flags SHA-1 signature as untrusted everywhere', () => {
    const { baseline, platforms } = inferCompatibility({ rootCA: 'DigiCert Inc', sigAlg: 'sha1WithRSAEncryption', keyBits: 2048 })
    expect(baseline).toBe('untrusted')
    expect(platforms.every((p) => p.status === 'untrusted')).toBe(true)
  })

  it('flags weak key size as untrusted', () => {
    expect(inferCompatibility({ rootCA: 'DigiCert Inc', sigAlg: 'sha256WithRSAEncryption', keyBits: 1024 }).baseline).toBe('untrusted')
  })

  it('flags distrusted legacy roots', () => {
    expect(inferCompatibility({ rootCA: 'Symantec Corp', sigAlg: 'sha256WithRSAEncryption', keyBits: 2048 }).baseline).toBe('untrusted')
  })

  it('handles missing input gracefully', () => {
    const { baseline, platforms } = inferCompatibility({})
    expect(baseline).toBe('trusted')
    expect(platforms.length).toBeGreaterThan(0)
  })
})
