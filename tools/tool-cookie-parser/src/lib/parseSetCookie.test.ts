import { describe, it, expect } from 'vitest'
import { parseSetCookieHeader, formatRelative } from './parseSetCookie'

describe('parseSetCookieHeader', () => {
  it('parses a fully-specified Set-Cookie line', () => {
    const line =
      'sid=abc; Path=/; Domain=example.com; Expires=Wed, 09 Jun 2100 10:18:14 GMT; Max-Age=3600; Secure; HttpOnly; SameSite=Strict'
    const r = parseSetCookieHeader(line)
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.items).toHaveLength(1)
    const item = r.items[0]
    expect(item.name).toBe('sid')
    expect(item.value).toBe('abc')
    expect(item.attrs.path).toBe('/')
    expect(item.attrs.domain).toBe('example.com')
    expect(item.attrs.expires).toContain('2100')
    expect(item.attrs.maxAge).toBe(3600)
    expect(item.attrs.secure).toBe(true)
    expect(item.attrs.httpOnly).toBe(true)
    expect(item.attrs.sameSite).toBe('Strict')
  })

  it('parses multiple Set-Cookie lines separated by \\n', () => {
    const input = ['a=1; Path=/', 'b=2; Domain=foo.test; Secure'].join('\n')
    const r = parseSetCookieHeader(input)
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.items).toHaveLength(2)
    expect(r.items[0].name).toBe('a')
    expect(r.items[1].name).toBe('b')
    expect(r.items[1].attrs.secure).toBe(true)
  })

  it('accepts attribute names in any case (Max-Age, MAX-AGE, maxage, HTTPONLY, samesite)', () => {
    const line = 'x=1; MAX-AGE=120; httponly; samesite=lax; SECURE'
    const r = parseSetCookieHeader(line)
    expect(r.ok).toBe(true)
    if (!r.ok) return
    const a = r.items[0].attrs
    expect(a.maxAge).toBe(120)
    expect(a.httpOnly).toBe(true)
    expect(a.secure).toBe(true)
    expect(a.sameSite).toBe('Lax')
  })

  it('flags SameSite=None without Secure as a danger warning', () => {
    const r = parseSetCookieHeader('x=1; SameSite=None')
    expect(r.ok).toBe(true)
    if (!r.ok) return
    const warnings = r.items[0].warnings
    expect(warnings.some((w) => w.level === 'danger' && w.key === 'sameSiteNoneRequiresSecure')).toBe(true)
  })

  it('does NOT flag SameSite=None when Secure is set', () => {
    const r = parseSetCookieHeader('x=1; SameSite=None; Secure')
    expect(r.ok).toBe(true)
    if (!r.ok) return
    const warnings = r.items[0].warnings
    expect(warnings.some((w) => w.key === 'sameSiteNoneRequiresSecure')).toBe(false)
  })

  it('flags Expires in the past as a warning', () => {
    const r = parseSetCookieHeader('x=1; Expires=Thu, 01 Jan 1970 00:00:00 GMT')
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.items[0].warnings.some((w) => w.key === 'alreadyExpired')).toBe(true)
  })

  it('flags missing HttpOnly when name looks like a session token (token / sid / auth / jwt)', () => {
    const cases = ['authToken=xxx', 'sid=xxx', 'jwt=xxx', 'auth=xxx']
    for (const line of cases) {
      const r = parseSetCookieHeader(line)
      expect(r.ok).toBe(true)
      if (!r.ok) return
      expect(
        r.items[0].warnings.some((w) => w.key === 'tokenShouldBeHttpOnly'),
        `expected warning for ${line}`,
      ).toBe(true)
    }
  })

  it('does NOT flag tokenShouldBeHttpOnly when HttpOnly is set', () => {
    const r = parseSetCookieHeader('authToken=xxx; HttpOnly')
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.items[0].warnings.some((w) => w.key === 'tokenShouldBeHttpOnly')).toBe(false)
  })

  it('adds info:noDomainHostOnly when Domain is missing', () => {
    const r = parseSetCookieHeader('x=1; Path=/')
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.items[0].warnings.some((w) => w.level === 'info' && w.key === 'noDomainHostOnly')).toBe(true)
  })

  it('skips empty / invalid lines and counts them', () => {
    const r = parseSetCookieHeader('\n\n=bad\nok=1; Path=/\n')
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.items).toHaveLength(1)
    expect(r.items[0].name).toBe('ok')
    expect(r.skipped).toBeGreaterThan(0)
  })

  it('preserves `=` characters inside the cookie value', () => {
    const r = parseSetCookieHeader('token=abc=def; Path=/')
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.items[0].value).toBe('abc=def')
  })
})

describe('formatRelative', () => {
  it('reports past for earlier timestamps', () => {
    const now = Date.parse('2024-06-01T00:00:00Z')
    const r = formatRelative(now - 2 * 24 * 3600 * 1000, now)
    expect(r.past).toBe(true)
    expect(r.unit).toBe('day')
    expect(r.amount).toBe(2)
  })

  it('reports future for upcoming timestamps', () => {
    const now = Date.parse('2024-06-01T00:00:00Z')
    const r = formatRelative(now + 3 * 3600 * 1000, now)
    expect(r.past).toBe(false)
    expect(r.unit).toBe('hour')
    expect(r.amount).toBe(3)
  })
})
