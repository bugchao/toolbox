import { describe, it, expect } from 'vitest'
import { md5Hex } from './md5'
import { apr1 } from './apr1'
import { shaHash } from './sha'
import { bcryptHash, bcryptVerify, toApacheBcrypt } from './bcrypt'
import {
  validateUsername,
  isPasswordValid,
  computeHash,
  formatEntry,
  buildHtpasswdFile,
} from './htpasswd'

const enc = (s: string) => new TextEncoder().encode(s)

describe('md5', () => {
  it('matches RFC 1321 test vectors', () => {
    expect(md5Hex(enc(''))).toBe('d41d8cd98f00b204e9800998ecf8427e')
    expect(md5Hex(enc('abc'))).toBe('900150983cd24fb0d6963f7d28e17f72')
    expect(md5Hex(enc('message digest'))).toBe('f96b697d7cb7938d525a2f31aaf161d0')
    expect(md5Hex(enc('The quick brown fox jumps over the lazy dog'))).toBe(
      '9e107d9d372bb6826bd81d3542a419d6',
    )
  })
})

describe('apr1 (Apache MD5)', () => {
  // 由 `openssl passwd -apr1 -salt <salt> <password>` 生成的已知向量
  it('matches openssl vectors', () => {
    expect(apr1('myPassword', 'SaltSalt')).toBe('$apr1$SaltSalt$ZIQEj2kUloCPVY31X5YJK0')
    expect(apr1('password', 'abcd1234')).toBe('$apr1$abcd1234$kDEexREaC0S6a7lHugd.L.')
    expect(apr1('test', '12345678')).toBe('$apr1$12345678$e74Lvsv64yfuPhXCxCD7n1')
  })

  it('truncates salt to 8 chars', () => {
    expect(apr1('myPassword', 'SaltSaltEXTRA')).toBe('$apr1$SaltSalt$ZIQEj2kUloCPVY31X5YJK0')
  })

  it('generates a random salt when none provided', () => {
    const out = apr1('hello')
    expect(out).toMatch(/^\$apr1\$[./0-9A-Za-z]{1,8}\$[./0-9A-Za-z]{22}$/)
  })
})

describe('sha ({SHA} base64 sha1)', () => {
  it('matches openssl vectors', async () => {
    expect(await shaHash('password')).toBe('{SHA}W6ph5Mm5Pz8GgiULbPgzG37mj9g=')
    expect(await shaHash('test')).toBe('{SHA}qUqP5cyxm6YcTAhz05Hph5gvu9M=')
  })
})

describe('bcrypt', () => {
  it('produces $2y$ prefix and self-verifies', () => {
    const hash = bcryptHash('s3cret', 8)
    expect(hash.startsWith('$2y$08$')).toBe(true)
    expect(bcryptVerify('s3cret', hash)).toBe(true)
    expect(bcryptVerify('wrong', hash)).toBe(false)
  })

  it('normalizes $2a$/$2b$ prefixes', () => {
    expect(toApacheBcrypt('$2a$10$abc')).toBe('$2y$10$abc')
    expect(toApacheBcrypt('$2b$10$abc')).toBe('$2y$10$abc')
  })

  it('clamps cost into valid range', () => {
    expect(bcryptHash('x', 2).startsWith('$2y$04$')).toBe(true)
    expect(bcryptHash('x', 99).startsWith('$2y$17$')).toBe(true)
  })
})

describe('validateUsername', () => {
  it('accepts valid usernames', () => {
    expect(validateUsername('admin')).toEqual({ ok: true })
  })
  it('rejects empty', () => {
    expect(validateUsername('')).toEqual({ ok: false, reason: 'empty' })
  })
  it('rejects colon', () => {
    expect(validateUsername('a:b')).toEqual({ ok: false, reason: 'colon' })
  })
  it('rejects whitespace', () => {
    expect(validateUsername('a b')).toEqual({ ok: false, reason: 'whitespace' })
  })
})

describe('isPasswordValid', () => {
  it('rejects empty password', () => {
    expect(isPasswordValid('')).toBe(false)
    expect(isPasswordValid('x')).toBe(true)
  })
})

describe('computeHash', () => {
  it('dispatches per algorithm', async () => {
    expect(await computeHash('apr1', 'myPassword', { salt: 'SaltSalt' })).toBe(
      '$apr1$SaltSalt$ZIQEj2kUloCPVY31X5YJK0',
    )
    expect(await computeHash('sha', 'password')).toBe('{SHA}W6ph5Mm5Pz8GgiULbPgzG37mj9g=')
    const b = await computeHash('bcrypt', 'pw', { cost: 8 })
    expect(bcryptVerify('pw', b)).toBe(true)
  })
})

describe('htpasswd file assembly', () => {
  it('formats a single entry', () => {
    expect(formatEntry('admin', '$apr1$x$y')).toBe('admin:$apr1$x$y')
  })
  it('builds a multi-line file with trailing newline', () => {
    const file = buildHtpasswdFile([
      { username: 'a', hash: 'h1', algorithm: 'apr1' },
      { username: 'b', hash: 'h2', algorithm: 'sha' },
    ])
    expect(file).toBe('a:h1\nb:h2\n')
  })
  it('returns empty string for no entries', () => {
    expect(buildHtpasswdFile([])).toBe('')
  })
})
