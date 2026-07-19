import { describe, it, expect } from 'vitest'
import { buildCandidateList } from '../../server/checks/cipher-matrix.js'

describe('buildCandidateList', () => {
  it('returns a non-empty list for each known TLS version', () => {
    for (const key of ['tls12', 'tls11', 'tls10']) {
      const list = buildCandidateList(key)
      expect(list.length).toBeGreaterThan(0)
      expect(list.every((name) => typeof name === 'string' && name.length > 0)).toBe(true)
    }
  })

  it('returns an empty array for unknown version keys', () => {
    expect(buildCandidateList('tls13')).toEqual([])
    expect(buildCandidateList('bogus')).toEqual([])
  })
})
