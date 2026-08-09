import { describe, it, expect } from 'vitest'
import { buildDnsQuery, parseDnsMessage } from '../wire'

function hexToBytes(hex: string): Uint8Array {
  const clean = hex.replace(/\s+/g, '')
  const bytes = new Uint8Array(clean.length / 2)
  for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16)
  return bytes
}

// Captured live from a real RFC 8484 DoH server (google.com A query), verified via curl.
const REAL_A_RESPONSE = hexToBytes(
  '1234 8180 0001 0001 0000 0000 0667 6f6f 676c 6503 636f 6d00 0001 0001 c00c 0001 0001 0000 00f5 0004 8efb d2ce'
)

describe('parseDnsMessage', () => {
  it('parses a real captured A-record response', () => {
    expect(parseDnsMessage(REAL_A_RESPONSE)).toEqual(['142.251.210.206'])
  })

  it('returns an empty array for a non-zero RCODE (e.g. NXDOMAIN)', () => {
    const nxdomain = new Uint8Array(REAL_A_RESPONSE)
    nxdomain[3] = (nxdomain[3] & 0xf0) | 0x03 // RCODE=3
    expect(parseDnsMessage(nxdomain)).toEqual([])
  })

  it('returns an empty array for a truncated/too-short message', () => {
    expect(parseDnsMessage(new Uint8Array(4))).toEqual([])
  })

  it('parses multiple answers of the same type', () => {
    // header: ANCOUNT=2, question "a.com" A, two A answers pointing back at the question name
    const bytes = hexToBytes(
      '0000 8180 0001 0002 0000 0000' + // header, ANCOUNT=2
      '0161 03636f6d00 0001 0001' + // question: "a.com" A IN
      'c00c 0001 0001 00000000 0004 01010101' + // answer 1: 1.1.1.1
      'c00c 0001 0001 00000000 0004 02020202' // answer 2: 2.2.2.2
    )
    expect(parseDnsMessage(bytes)).toEqual(['1.1.1.1', '2.2.2.2'])
  })
})

describe('buildDnsQuery', () => {
  it('encodes the domain as length-prefixed labels terminated by a zero byte', () => {
    const query = buildDnsQuery('google.com', 'A')
    // header is 12 bytes, then: 6 'google' 3 'com' 0
    const question = Array.from(query.slice(12))
    expect(question.slice(0, 7)).toEqual([6, ...'google'.split('').map((c) => c.charCodeAt(0))])
    expect(question.slice(7, 11)).toEqual([3, ...'com'.split('').map((c) => c.charCodeAt(0))])
    expect(question[11]).toBe(0)
  })

  it('sets QTYPE to match the requested record type', () => {
    expect(Array.from(buildDnsQuery('x.com', 'AAAA').slice(-4, -2))).toEqual([0, 28])
    expect(Array.from(buildDnsQuery('x.com', 'A').slice(-4, -2))).toEqual([0, 1])
    expect(Array.from(buildDnsQuery('x.com', 'MX').slice(-4, -2))).toEqual([0, 15])
  })

  it('sets QDCOUNT=1 and ANCOUNT/NSCOUNT/ARCOUNT=0 in the header', () => {
    const query = buildDnsQuery('x.com', 'A')
    expect(Array.from(query.slice(4, 12))).toEqual([0, 1, 0, 0, 0, 0, 0, 0])
  })

  it('round-trips: a query built for a name can be used as the compressed-name target in a response', () => {
    const query = buildDnsQuery('a.com', 'A')
    // simulate a minimal response reusing the exact question bytes, matching real-world compression
    const header = hexToBytes('0000 8180 0001 0001 0000 0000')
    const answer = hexToBytes('c00c 0001 0001 00000000 0004 0a0a0a0a')
    const response = new Uint8Array([...header, ...query.slice(12), ...answer])
    expect(parseDnsMessage(response)).toEqual(['10.10.10.10'])
  })

  it('throws instead of silently corrupting a non-ASCII (IDN) label', () => {
    // charCodeAt('中') = 20013 → mod-256 into Uint8Array would silently send a
    // different, wrong domain instead of failing loudly.
    expect(() => buildDnsQuery('中国.cn', 'A')).toThrow(/ASCII/)
  })

  it('throws instead of encoding a label longer than 63 bytes', () => {
    expect(() => buildDnsQuery(`${'a'.repeat(64)}.com`, 'A')).toThrow(/63 bytes/)
  })
})

describe('formatRdata (TXT)', () => {
  it('decodes multi-byte UTF-8 TXT content instead of mangling it as Latin-1', () => {
    // header ANCOUNT=1, question "a.com" TXT, one TXT answer containing UTF-8 for "café"
    const utf8 = Array.from(new TextEncoder().encode('café'))
    const txtHex = [utf8.length, ...utf8].map((b) => b.toString(16).padStart(2, '0')).join('')
    const bytes = hexToBytes(
      '0000 8180 0001 0001 0000 0000' + // header, ANCOUNT=1
      '0161 03636f6d00 0010 0001' + // question: "a.com" TXT IN
      `c00c 0010 0001 00000000 ${(utf8.length + 1).toString(16).padStart(4, '0')} ${txtHex}`
    )
    expect(parseDnsMessage(bytes)).toEqual(['café'])
  })
})
