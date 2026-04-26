import { describe, it, expect } from 'vitest'
import { formatDuration } from './formatDuration'

describe('formatDuration', () => {
  it('formats zero seconds', () => {
    expect(formatDuration(0)).toBe('00:00:00')
  })

  it('formats seconds only', () => {
    expect(formatDuration(45)).toBe('00:00:45')
  })

  it('formats minutes and seconds', () => {
    expect(formatDuration(125)).toBe('00:02:05')
  })

  it('formats hours, minutes, and seconds', () => {
    expect(formatDuration(3665)).toBe('01:01:05')
  })

  it('pads single digits', () => {
    expect(formatDuration(3661)).toBe('01:01:01')
  })
})
