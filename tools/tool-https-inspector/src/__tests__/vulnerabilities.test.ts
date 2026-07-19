import { describe, it, expect } from 'vitest'
import {
  buildSslv2ClientHello,
  parseSslv2Response,
  buildPoodleClientHello,
  buildFreakClientHello,
  buildHeartbeatClientHello,
  buildHeartbeatRequest,
  parseHeartbeatRecord,
  evaluateHeartbeatResponse,
} from '../../server/tls-raw.js'

describe('SSLv2 (DROWN)', () => {
  it('builds a length-prefixed record with the high bit set (no-padding form)', () => {
    const hello = buildSslv2ClientHello()
    expect(hello[0] & 0x80).toBe(0x80)
    expect(hello[2]).toBe(0x01) // MSG-CLIENT-HELLO
  })

  it('recognizes an SSLv2 SERVER-HELLO response', () => {
    const resp = Buffer.from([0x80, 0x10, 0x04, 0x00, 0x00])
    expect(parseSslv2Response(resp).type).toBe('sslv2_server_hello')
  })

  it('treats a normal TLS alert (high bit unset) as not SSLv2', () => {
    const alert = Buffer.from([0x15, 0x03, 0x03, 0x00, 0x02, 0x02, 0x28])
    expect(parseSslv2Response(alert).type).toBe('not_sslv2')
  })

  it('reports incomplete for too-short buffers', () => {
    expect(parseSslv2Response(Buffer.from([0x80])).type).toBe('incomplete')
  })
})

describe('POODLE / FREAK ClientHello construction', () => {
  it('POODLE ClientHello uses SSLv3 record version and only CBC suites', () => {
    const hello = buildPoodleClientHello()
    expect(hello.readUInt16BE(1)).toBe(0x0300) // record version
    expect(hello.includes(Buffer.from([0x00, 0x2f]))).toBe(true) // AES128-CBC-SHA
  })

  it('FREAK ClientHello only offers EXPORT-grade suites', () => {
    const hello = buildFreakClientHello('example.com')
    expect(hello.includes(Buffer.from([0x00, 0x03]))).toBe(true) // EXPORT RC4 40
    expect(hello.includes(Buffer.from([0xc0, 0x2f]))).toBe(false) // no modern ECDHE suite offered
  })
})

describe('Heartbleed wire format', () => {
  it('ClientHello advertises the heartbeat extension (0x000f)', () => {
    const hello = buildHeartbeatClientHello('example.com')
    expect(hello.includes(Buffer.from([0x00, 0x0f, 0x00, 0x01, 0x01]))).toBe(true)
  })

  it('builds a heartbeat request record with a lied-about declared length', () => {
    const req = buildHeartbeatRequest(1, 16384)
    expect(req[0]).toBe(0x18) // content-type: heartbeat
    const msgType = req[5]
    const declaredLen = req.readUInt16BE(6)
    expect(msgType).toBe(0x01) // heartbeat_request
    expect(declaredLen).toBe(16384)
    // 记录里真实携带的字节数应远小于声明的谎报长度
    expect(req.length).toBeLessThan(100)
  })

  it('parseHeartbeatRecord extracts the declared length from a response record', () => {
    const body = Buffer.concat([Buffer.from([0x02]), Buffer.from([0x40, 0x00]), Buffer.alloc(16384 + 16, 0x99)])
    const record = Buffer.concat([Buffer.from([0x18]), Buffer.from([0x03, 0x01]), Buffer.from([(body.length >> 8) & 0xff, body.length & 0xff]), body])
    const parsed = parseHeartbeatRecord(record)
    expect(parsed?.declaredLen).toBe(16384)
  })

  it('parseHeartbeatRecord returns null for non-heartbeat records', () => {
    const alert = Buffer.from([0x15, 0x03, 0x03, 0x00, 0x02, 0x02, 0x28])
    expect(parseHeartbeatRecord(alert)).toBeNull()
  })

  it('evaluateHeartbeatResponse flags vulnerability only when server over-reports', () => {
    expect(evaluateHeartbeatResponse(1, 16384)).toEqual({ vulnerable: true, leakedBytes: 16383 })
    expect(evaluateHeartbeatResponse(1, 1)).toEqual({ vulnerable: false, leakedBytes: 0 })
    expect(evaluateHeartbeatResponse(1, 0)).toEqual({ vulnerable: false, leakedBytes: 0 })
  })

  it('never exposes raw leaked bytes — only a count', () => {
    const result = evaluateHeartbeatResponse(1, 16384)
    const keys = Object.keys(result)
    expect(keys).toEqual(['vulnerable', 'leakedBytes'])
    expect(typeof result.leakedBytes).toBe('number')
  })
})
