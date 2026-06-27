import { describe, expect, it } from 'vitest'
import {
  createDefaultState,
  fromOctal,
  isValidOctal,
  toOctal,
  toOctal4,
  toSymbolic,
  type ChmodState,
} from './chmod'

const make = (octal: string): ChmodState => {
  const s = fromOctal(octal)
  if (!s) throw new Error(`invalid octal in test: ${octal}`)
  return s
}

describe('toOctal / toSymbolic basic', () => {
  it('default state is 755 / rwxr-xr-x', () => {
    const s = createDefaultState()
    expect(toOctal(s)).toBe('755')
    expect(toSymbolic(s)).toBe('rwxr-xr-x')
  })

  it('644 -> rw-r--r--', () => {
    expect(toSymbolic(make('644'))).toBe('rw-r--r--')
  })

  it('000 -> ---------', () => {
    expect(toOctal(make('000'))).toBe('000')
    expect(toSymbolic(make('000'))).toBe('---------')
  })

  it('777 -> rwxrwxrwx', () => {
    expect(toSymbolic(make('777'))).toBe('rwxrwxrwx')
  })
})

describe('special bits in symbolic', () => {
  it('setuid with owner execute -> s', () => {
    // 4755: setuid, rwxr-xr-x
    expect(toSymbolic(make('4755'))).toBe('rwsr-xr-x')
  })

  it('setuid without owner execute -> S', () => {
    // 4644: setuid, rw-r--r--
    expect(toSymbolic(make('4644'))).toBe('rwSr--r--')
  })

  it('setgid with group execute -> s', () => {
    // 2755: setgid, rwxr-xr-x
    expect(toSymbolic(make('2755'))).toBe('rwxr-sr-x')
  })

  it('setgid without group execute -> S', () => {
    // 2740: setgid, rwxr-----
    expect(toSymbolic(make('2740'))).toBe('rwxr-S---')
  })

  it('sticky with other execute -> t', () => {
    // 1777: sticky, rwxrwxrwx
    expect(toSymbolic(make('1777'))).toBe('rwxrwxrwt')
  })

  it('sticky without other execute -> T', () => {
    // 1776: sticky, rwxrwxrw-
    expect(toSymbolic(make('1776'))).toBe('rwxrwxrwT')
  })

  it('all special bits combined', () => {
    // 7755: setuid+setgid+sticky, rwxr-xr-x
    expect(toSymbolic(make('7755'))).toBe('rwsr-sr-t')
  })
})

describe('toOctal with special bits', () => {
  it('keeps 3 digits when no special bits', () => {
    expect(toOctal(make('0755'))).toBe('755')
  })

  it('uses 4 digits when special bits present', () => {
    expect(toOctal(make('4755'))).toBe('4755')
  })

  it('toOctal4 always 4 digits', () => {
    expect(toOctal4(make('755'))).toBe('0755')
    expect(toOctal4(make('1777'))).toBe('1777')
  })
})

describe('isValidOctal / fromOctal', () => {
  it('accepts 3 and 4 digit octals', () => {
    expect(isValidOctal('755')).toBe(true)
    expect(isValidOctal('4755')).toBe(true)
    expect(isValidOctal(' 644 ')).toBe(true)
  })

  it('rejects invalid input', () => {
    expect(isValidOctal('')).toBe(false)
    expect(isValidOctal('8')).toBe(false)
    expect(isValidOctal('75')).toBe(false)
    expect(isValidOctal('75555')).toBe(false)
    expect(isValidOctal('rwx')).toBe(false)
    expect(fromOctal('999')).toBeNull()
  })

  it('round-trips state -> octal -> state', () => {
    const s = make('4751')
    expect(toOctal(fromOctal(toOctal(s))!)).toBe('4751')
  })
})
