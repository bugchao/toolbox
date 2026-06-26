import { describe, it, expect } from 'vitest'
import {
  compareStrings,
  diff,
  format,
  inc,
  isValid,
  maxSatisfying,
  parse,
  satisfies,
  sortVersions,
} from './semver'

describe('parse / isValid', () => {
  it('parses core version', () => {
    expect(parse('1.2.3')).toMatchObject({ major: 1, minor: 2, patch: 3, prerelease: [], build: [] })
  })
  it('strips leading v', () => {
    expect(parse('v2.0.0')?.major).toBe(2)
  })
  it('parses prerelease and build', () => {
    const v = parse('1.0.0-alpha.1+build.5')
    expect(v?.prerelease).toEqual(['alpha', '1'])
    expect(v?.build).toEqual(['build', '5'])
  })
  it('rejects invalid', () => {
    expect(parse('1.2')).toBeNull()
    expect(parse('1.2.x')).toBeNull()
    expect(parse('abc')).toBeNull()
    expect(isValid('1.2.3')).toBe(true)
    expect(isValid('nope')).toBe(false)
  })
  it('format round-trips', () => {
    const s = '1.2.3-rc.1+exp.sha.5114f85'
    expect(format(parse(s)!)).toBe(s)
  })
})

describe('compare', () => {
  it('orders by major/minor/patch', () => {
    expect(compareStrings('1.0.0', '2.0.0')).toBe(-1)
    expect(compareStrings('1.2.0', '1.1.9')).toBe(1)
    expect(compareStrings('1.2.3', '1.2.3')).toBe(0)
  })
  it('prerelease < release', () => {
    expect(compareStrings('1.0.0-alpha', '1.0.0')).toBe(-1)
    expect(compareStrings('1.0.0', '1.0.0-alpha')).toBe(1)
  })
  it('prerelease precedence per spec', () => {
    // 1.0.0-alpha < 1.0.0-alpha.1 < 1.0.0-alpha.beta < 1.0.0-beta < 1.0.0-beta.2 < 1.0.0-beta.11 < 1.0.0-rc.1
    const ordered = [
      '1.0.0-alpha',
      '1.0.0-alpha.1',
      '1.0.0-alpha.beta',
      '1.0.0-beta',
      '1.0.0-beta.2',
      '1.0.0-beta.11',
      '1.0.0-rc.1',
      '1.0.0',
    ]
    for (let i = 0; i < ordered.length - 1; i++) {
      expect(compareStrings(ordered[i], ordered[i + 1])).toBe(-1)
    }
  })
  it('ignores build metadata', () => {
    expect(compareStrings('1.0.0+a', '1.0.0+b')).toBe(0)
  })
  it('throws on invalid', () => {
    expect(() => compareStrings('1.0', '1.0.0')).toThrow()
  })
})

describe('sortVersions', () => {
  it('ascending, drops invalid', () => {
    expect(sortVersions(['1.2.0', 'bad', '1.0.0', '1.10.0', '1.0.0-rc']))
      .toEqual(['1.0.0-rc', '1.0.0', '1.2.0', '1.10.0'])
  })
  it('descending', () => {
    expect(sortVersions(['1.0.0', '2.0.0', '1.5.0'], true)).toEqual(['2.0.0', '1.5.0', '1.0.0'])
  })
})

describe('diff', () => {
  it('reports highest changed level', () => {
    expect(diff('1.0.0', '2.0.0')).toBe('major')
    expect(diff('1.0.0', '1.1.0')).toBe('minor')
    expect(diff('1.0.0', '1.0.1')).toBe('patch')
    expect(diff('1.0.0-a', '1.0.0-b')).toBe('prerelease')
    expect(diff('1.0.0', '1.0.0')).toBe('none')
  })
})

describe('satisfies', () => {
  it('caret allows minor/patch within same major', () => {
    expect(satisfies('1.2.3', '^1.0.0')).toBe(true)
    expect(satisfies('1.9.9', '^1.0.0')).toBe(true)
    expect(satisfies('2.0.0', '^1.0.0')).toBe(false)
  })
  it('caret for 0.x locks minor', () => {
    expect(satisfies('0.2.5', '^0.2.0')).toBe(true)
    expect(satisfies('0.3.0', '^0.2.0')).toBe(false)
  })
  it('tilde allows patch within same minor', () => {
    expect(satisfies('1.2.9', '~1.2.0')).toBe(true)
    expect(satisfies('1.3.0', '~1.2.0')).toBe(false)
  })
  it('comparators and AND', () => {
    expect(satisfies('1.5.0', '>=1.0.0 <2.0.0')).toBe(true)
    expect(satisfies('2.0.0', '>=1.0.0 <2.0.0')).toBe(false)
  })
  it('OR with ||', () => {
    expect(satisfies('3.0.0', '^1.0.0 || ^3.0.0')).toBe(true)
    expect(satisfies('2.0.0', '^1.0.0 || ^3.0.0')).toBe(false)
  })
  it('wildcard matches anything', () => {
    expect(satisfies('9.9.9', '*')).toBe(true)
  })
  it('exact match', () => {
    expect(satisfies('1.2.3', '1.2.3')).toBe(true)
    expect(satisfies('1.2.4', '1.2.3')).toBe(false)
  })
  it('invalid version → false', () => {
    expect(satisfies('bad', '^1.0.0')).toBe(false)
  })
})

describe('maxSatisfying', () => {
  it('picks highest matching', () => {
    expect(maxSatisfying(['1.0.0', '1.2.0', '1.9.0', '2.0.0'], '^1.0.0')).toBe('1.9.0')
  })
  it('null when none match', () => {
    expect(maxSatisfying(['2.0.0', '3.0.0'], '^1.0.0')).toBeNull()
  })
})

describe('inc', () => {
  it('bumps and resets lower parts', () => {
    expect(inc('1.2.3', 'major')).toBe('2.0.0')
    expect(inc('1.2.3', 'minor')).toBe('1.3.0')
    expect(inc('1.2.3', 'patch')).toBe('1.2.4')
  })
  it('drops prerelease on bump', () => {
    expect(inc('1.2.3-rc.1', 'patch')).toBe('1.2.4')
  })
  it('null on invalid', () => {
    expect(inc('bad', 'major')).toBeNull()
  })
})
