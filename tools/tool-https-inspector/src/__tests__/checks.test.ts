import { describe, it, expect } from 'vitest'
import { computeGrade } from '../../server/checks/https.js'
import { matchCdn } from '../../server/checks/cdn.js'
import { parseEhloCapabilities, supportsStartTls } from '../../server/checks/mail.js'
import {
  buildGmClientHello,
  buildPqcClientHello,
  parseServerHello,
  isGmCipher,
  isPqcGroup,
  classifyProbeError,
} from '../../server/tls-raw.js'

const cleanCert = { expired: false, selfSigned: false, daysRemaining: 200 }

describe('computeGrade', () => {
  it('gives A+ for TLS1.3+1.2 only with AEAD', () => {
    const { grade } = computeGrade({
      protocols: { tls13: true, tls12: true, tls11: false, tls10: false },
      cert: cleanCert,
      cipher: 'TLS_AES_128_GCM_SHA256',
    })
    expect(grade).toBe('A+')
  })

  it('caps at B when TLS 1.0/1.1 is still supported', () => {
    const { grade, reasons } = computeGrade({
      protocols: { tls13: true, tls12: true, tls11: true, tls10: false },
      cert: cleanCert,
      cipher: 'TLS_AES_128_GCM_SHA256',
    })
    expect(grade).toBe('B')
    expect(reasons.join()).toMatch(/1\.0\/1\.1/)
  })

  it('downgrades to B for non-AEAD cipher', () => {
    const { grade } = computeGrade({
      protocols: { tls13: true, tls12: true, tls11: false, tls10: false },
      cert: cleanCert,
      cipher: 'ECDHE-RSA-AES128-SHA',
    })
    expect(grade).toBe('B')
  })

  it('returns T for expired or self-signed certs', () => {
    expect(computeGrade({ protocols: { tls12: true }, cert: { ...cleanCert, expired: true }, cipher: 'x' }).grade).toBe('T')
    expect(computeGrade({ protocols: { tls12: true }, cert: { ...cleanCert, selfSigned: true }, cipher: 'x' }).grade).toBe('T')
  })

  it('returns F when no TLS 1.2/1.3', () => {
    expect(computeGrade({ protocols: { tls12: false, tls13: false }, cert: cleanCert, cipher: 'x' }).grade).toBe('F')
  })
})

describe('matchCdn', () => {
  it('matches known CDN vendors by CNAME', () => {
    expect(matchCdn(['foo.cloudflare.net'])?.vendor).toBe('Cloudflare')
    expect(matchCdn(['x.alikunlun.com'])?.vendor).toBe('阿里云 CDN')
    expect(matchCdn(['d123.cloudfront.net'])?.vendor).toBe('Amazon CloudFront')
  })

  it('returns null when nothing matches', () => {
    expect(matchCdn(['example.com', ''])).toBeNull()
  })
})

describe('mail EHLO parsing', () => {
  it('parses capabilities and detects STARTTLS', () => {
    const caps = parseEhloCapabilities('250-mx.test.com\r\n250-SIZE 10240000\r\n250-STARTTLS\r\n250 8BITMIME')
    expect(caps).toContain('STARTTLS')
    expect(supportsStartTls(caps)).toBe(true)
  })

  it('detects missing STARTTLS', () => {
    const caps = parseEhloCapabilities('250-mx.test.com\r\n250 SIZE 10240000')
    expect(supportsStartTls(caps)).toBe(false)
  })
})

// 用与生产代码相同的编码方式构造合成 ServerHello，验证解析
function u16(n: number) {
  return Buffer.from([(n >> 8) & 0xff, n & 0xff])
}
function u24(n: number) {
  return Buffer.from([(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff])
}
function serverHello(version: number, random: Buffer, cipher: number, extensions = Buffer.alloc(0)) {
  const body = Buffer.concat([
    u16(version),
    random,
    Buffer.from([0x00]), // session id len 0
    u16(cipher),
    Buffer.from([0x00]), // compression
    extensions.length ? Buffer.concat([u16(extensions.length), extensions]) : Buffer.alloc(0),
  ])
  const hs = Buffer.concat([Buffer.from([0x02]), u24(body.length), body])
  return Buffer.concat([Buffer.from([0x16]), u16(version), u16(hs.length), hs])
}

const HRR_RANDOM = Buffer.from(
  'cf21ad74e59a6111be1d8c021e65b891c2a2116717abb8c5e079e09e2c8a8339',
  'hex',
)

describe('raw TLS parsing', () => {
  it('classifies GM cipher suites', () => {
    expect(isGmCipher(0xe013)).toBe(true)
    expect(isGmCipher(0x1301)).toBe(false)
  })

  it('classifies post-quantum groups', () => {
    expect(isPqcGroup(0x11ec)).toBe(true)
    expect(isPqcGroup(0x001d)).toBe(false)
  })

  it('parses a GM ServerHello and reads the selected cipher', () => {
    const buf = serverHello(0x0101, Buffer.alloc(32, 1), 0xe013)
    const parsed = parseServerHello(buf)
    expect(parsed.type).toBe('server_hello')
    expect(parsed.cipherSuite).toBe(0xe013)
    expect(isGmCipher(parsed.cipherSuite)).toBe(true)
  })

  it('parses a HelloRetryRequest selecting X25519MLKEM768', () => {
    const keyShareExt = Buffer.concat([u16(0x0033), u16(2), u16(0x11ec)])
    const buf = serverHello(0x0303, HRR_RANDOM, 0x1301, keyShareExt)
    const parsed = parseServerHello(buf)
    expect(parsed.type).toBe('server_hello')
    expect(parsed.isHRR).toBe(true)
    expect(parsed.selectedGroup).toBe(0x11ec)
    expect(isPqcGroup(parsed.selectedGroup)).toBe(true)
  })

  it('treats connection reset as not-supported, timeout as error', () => {
    expect(classifyProbeError({ code: 'ECONNRESET' })).toBe('not-supported')
    expect(classifyProbeError({ code: 'EPIPE' })).toBe('not-supported')
    expect(classifyProbeError({ code: 'ETIMEDOUT', message: '连接超时' })).toBe('error')
    expect(classifyProbeError({ code: 'ENOTFOUND' })).toBe('error')
  })

  it('parses an alert record', () => {
    const alert = Buffer.concat([Buffer.from([0x15]), u16(0x0303), u16(2), Buffer.from([0x02, 0x28])])
    expect(parseServerHello(alert).type).toBe('alert')
  })

  it('builds a GM ClientHello with SM2 suites', () => {
    const hello = buildGmClientHello('example.com')
    expect(hello[0]).toBe(0x16) // handshake record
    expect(hello.includes(Buffer.from([0xe0, 0x13]))).toBe(true)
  })

  it('builds a PQC ClientHello advertising X25519MLKEM768', () => {
    const hello = buildPqcClientHello('example.com')
    expect(hello[0]).toBe(0x16)
    expect(hello.includes(Buffer.from([0x11, 0xec]))).toBe(true)
  })
})
