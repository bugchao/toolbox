import { describe, it, expect } from 'vitest'
import { parseOpensslCertText } from '../../server/checks/openssl-cert.js'

const SAMPLE = `Certificate:
    Data:
        Version: 3 (0x2)
        Serial Number:
            01:02:03
        Signature Algorithm: sha256WithRSAEncryption
        Issuer: C=US, O=Let's Encrypt, CN=R3
        Validity
            Not Before: Jan  1 00:00:00 2026 GMT
            Not After : Apr  1 00:00:00 2026 GMT
        Subject: CN=example.com
        Subject Public Key Info:
            Public Key Algorithm: rsaEncryption
                Public-Key: (2048 bit)
        X509v3 extensions:
            CT Precertificate SCTs:
                Signed Certificate Timestamp:
                    Version   : v1
    Signature Algorithm: sha256WithRSAEncryption`

describe('parseOpensslCertText', () => {
  it('extracts signature algorithm, public key info and CT presence', () => {
    const result = parseOpensslCertText(SAMPLE)
    expect(result.signatureAlgorithm).toBe('sha256WithRSAEncryption')
    expect(result.publicKeyAlgorithm).toBe('rsaEncryption')
    expect(result.publicKeyBits).toBe('2048')
    expect(result.ctCompliant).toBe(true)
  })

  it('reports ctCompliant false when SCT extension is absent', () => {
    const withoutSct = SAMPLE.replace(/CT Precertificate SCTs:[\s\S]*?Version   : v1/, '')
    expect(parseOpensslCertText(withoutSct).ctCompliant).toBe(false)
  })

  it('returns empty strings for missing fields instead of throwing', () => {
    const result = parseOpensslCertText('garbage text with no matches')
    expect(result).toEqual({
      signatureAlgorithm: '',
      publicKeyAlgorithm: '',
      publicKeyBits: '',
      ctCompliant: false,
    })
  })
})
