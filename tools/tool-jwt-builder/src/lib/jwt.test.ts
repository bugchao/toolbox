import { describe, it, expect } from 'vitest'
import {
  base64UrlDecode,
  base64UrlEncode,
  buildClaimsTemplate,
  parsePayload,
  signJwt,
  verifyJwt,
} from './jwt'

describe('base64url', () => {
  it('encodes without + / = characters', () => {
    const bytes = new Uint8Array([0xfb, 0xff, 0xfe, 0x00, 0x01])
    const s = base64UrlEncode(bytes)
    expect(s).not.toMatch(/[+/=]/)
  })
  it('round-trips bytes', () => {
    const bytes = new Uint8Array(64).map((_, i) => i * 4 % 256)
    const back = base64UrlDecode(base64UrlEncode(bytes))
    expect(back).not.toBeNull()
    expect([...back!]).toEqual([...bytes])
  })
  it('rejects impossible length', () => {
    expect(base64UrlDecode('aaaaa')).toBeNull()
  })
})

describe('signJwt', () => {
  it('produces three base64url segments', async () => {
    const r = await signJwt({ alg: 'HS256', payload: { sub: 'x' }, secret: 'top-secret' })
    expect(r.ok).toBe(true)
    if (r.ok) {
      const parts = r.token.split('.')
      expect(parts).toHaveLength(3)
      parts.forEach((p) => expect(p).not.toMatch(/[+/=]/))
    }
  })

  it('header carries alg + typ and protects them from override', async () => {
    const r = await signJwt({
      alg: 'HS384',
      payload: { a: 1 },
      secret: 's',
      headerExtra: { kid: 'key-1', alg: 'none', typ: 'evil' },
    })
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.header.alg).toBe('HS384')
      expect(r.header.typ).toBe('JWT')
      expect(r.header.kid).toBe('key-1')
    }
  })

  it('HS256 matches RFC 7519 style known vector', async () => {
    // 用 jwt.io 默认样例（secret: 'your-256-bit-secret'）做已知向量
    const r = await signJwt({
      alg: 'HS256',
      payload: { sub: '1234567890', name: 'John Doe', iat: 1516239022 },
      secret: 'your-256-bit-secret',
    })
    expect(r.ok).toBe(true)
    if (r.ok) {
      // jwt.io 的经典 token 签名段
      expect(r.token.split('.')[2]).toBe('SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c')
    }
  })

  it('rejects empty secret', async () => {
    const r = await signJwt({ alg: 'HS256', payload: {}, secret: '' })
    expect(r.ok).toBe(false)
  })

  it('supports base64-encoded secrets', async () => {
    // 'secret' 的 base64 = c2VjcmV0
    const viaB64 = await signJwt({ alg: 'HS256', payload: { x: 1 }, secret: 'c2VjcmV0', secretEncoding: 'base64' })
    const viaUtf8 = await signJwt({ alg: 'HS256', payload: { x: 1 }, secret: 'secret', secretEncoding: 'utf8' })
    expect(viaB64.ok && viaUtf8.ok).toBe(true)
    if (viaB64.ok && viaUtf8.ok) expect(viaB64.token).toBe(viaUtf8.token)
  })

  it('different algs give different signatures', async () => {
    const a = await signJwt({ alg: 'HS256', payload: { x: 1 }, secret: 's' })
    const b = await signJwt({ alg: 'HS512', payload: { x: 1 }, secret: 's' })
    if (a.ok && b.ok) {
      expect(a.token.split('.')[2]).not.toBe(b.token.split('.')[2])
    }
  })
})

describe('verifyJwt', () => {
  it('verifies a freshly signed token', async () => {
    const signed = await signJwt({ alg: 'HS256', payload: { hello: 'world' }, secret: 'k' })
    expect(signed.ok).toBe(true)
    if (signed.ok) {
      const v = await verifyJwt(signed.token, 'k')
      expect(v.ok && v.valid).toBe(true)
      if (v.ok) expect(v.alg).toBe('HS256')
    }
  })

  it('fails with wrong secret', async () => {
    const signed = await signJwt({ alg: 'HS256', payload: { hello: 'world' }, secret: 'k' })
    if (signed.ok) {
      const v = await verifyJwt(signed.token, 'wrong')
      expect(v.ok && !v.valid).toBe(true)
    }
  })

  it('fails on tampered payload', async () => {
    const signed = await signJwt({ alg: 'HS256', payload: { role: 'user' }, secret: 'k' })
    if (signed.ok) {
      const [h, , s] = signed.token.split('.')
      const evil = `${h}.${base64UrlEncode(new TextEncoder().encode('{"role":"admin"}'))}.${s}`
      const v = await verifyJwt(evil, 'k')
      expect(v.ok && !v.valid).toBe(true)
    }
  })

  it('rejects malformed token / unsupported alg', async () => {
    expect((await verifyJwt('one.two', 'k')).ok).toBe(false)
    // alg: none token
    const noneHeader = base64UrlEncode(new TextEncoder().encode('{"alg":"none"}'))
    const r = await verifyJwt(`${noneHeader}.e30.`, 'k')
    expect(r.ok).toBe(false)
  })
})

describe('parsePayload', () => {
  it('accepts a JSON object', () => {
    const r = parsePayload('{"a":1}')
    expect(r.ok).toBe(true)
  })
  it('rejects arrays / scalars / bad JSON / empty', () => {
    expect(parsePayload('[1]').ok).toBe(false)
    expect(parsePayload('"x"').ok).toBe(false)
    expect(parsePayload('{bad').ok).toBe(false)
    expect(parsePayload('  ').ok).toBe(false)
  })
})

describe('buildClaimsTemplate', () => {
  it('contains sub/iat/exp with exp 1h after iat', () => {
    const c = buildClaimsTemplate(1000)
    expect(c.iat).toBe(1000)
    expect(c.exp).toBe(4600)
    expect(c.sub).toBeDefined()
  })
})
