import { describe, it, expect } from 'vitest'
import { parseDohAnswer } from '../index'

describe('parseDohAnswer', () => {
  it('extracts data from a normal A-record response', () => {
    const json = {
      Status: 0,
      Answer: [{ name: 'google.com.', type: 1, TTL: 300, data: '142.250.72.14' }],
    }
    expect(parseDohAnswer(json)).toEqual(['142.250.72.14'])
  })

  it('extracts multiple records', () => {
    const json = {
      Status: 0,
      Answer: [
        { data: '1.1.1.1' },
        { data: '1.0.0.1' },
      ],
    }
    expect(parseDohAnswer(json)).toEqual(['1.1.1.1', '1.0.0.1'])
  })

  it('returns empty array for non-zero Status (e.g. NXDOMAIN)', () => {
    const json = { Status: 3, Answer: [{ data: 'ignored' }] }
    expect(parseDohAnswer(json)).toEqual([])
  })

  it('returns empty array when Answer is missing', () => {
    expect(parseDohAnswer({ Status: 0 })).toEqual([])
  })

  it('returns empty array for malformed input', () => {
    expect(parseDohAnswer(null)).toEqual([])
    expect(parseDohAnswer('not json')).toEqual([])
    expect(parseDohAnswer(undefined)).toEqual([])
  })

  it('skips entries with missing or non-string data', () => {
    const json = { Status: 0, Answer: [{ data: '1.1.1.1' }, {}, { data: 42 }] }
    expect(parseDohAnswer(json)).toEqual(['1.1.1.1'])
  })
})
