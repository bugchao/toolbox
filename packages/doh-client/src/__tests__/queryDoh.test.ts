import { describe, it, expect, vi, beforeEach } from 'vitest'
import { queryDohJson } from '../json'
import { queryDohWire } from '../wire'

beforeEach(() => {
  global.fetch = vi.fn()
})

describe('queryDohJson', () => {
  it('throws when the response is not ok, instead of trying to parse an error body', async () => {
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 502,
      json: async () => { throw new Error('should not be called') },
    })
    await expect(queryDohJson('https://example.com/dns-query', 'google.com', 'A', false)).rejects.toThrow('502')
  })
})

describe('queryDohWire', () => {
  it('throws when the response is not ok, instead of trying to parse an error body', async () => {
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 500,
      arrayBuffer: async () => { throw new Error('should not be called') },
    })
    await expect(queryDohWire('https://example.com/dns-query', 'google.com', 'A')).rejects.toThrow('500')
  })
})
