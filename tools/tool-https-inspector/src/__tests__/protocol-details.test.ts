import { describe, it, expect } from 'vitest'
import { hasForwardSecrecy } from '../../server/checks/protocol-details.js'

describe('hasForwardSecrecy', () => {
  it('recognizes ECDHE/DHE cipher names', () => {
    expect(hasForwardSecrecy('ECDHE-RSA-AES128-GCM-SHA256')).toBe(true)
    expect(hasForwardSecrecy('DHE-RSA-AES256-SHA')).toBe(true)
  })

  it('recognizes TLS 1.3 ciphers as forward-secret', () => {
    expect(hasForwardSecrecy('TLS_AES_128_GCM_SHA256')).toBe(true)
    expect(hasForwardSecrecy('TLS_CHACHA20_POLY1305_SHA256')).toBe(true)
  })

  it('rejects static RSA key exchange ciphers', () => {
    expect(hasForwardSecrecy('AES128-SHA')).toBe(false)
    expect(hasForwardSecrecy('RSA-AES256-SHA')).toBe(false)
  })

  it('handles empty input', () => {
    expect(hasForwardSecrecy('')).toBe(false)
  })
})
