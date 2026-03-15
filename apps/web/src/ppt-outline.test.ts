import { describe, it, expect } from 'vitest'
import { parseOutline } from '@toolbox/tool-ppt-generator'

describe('parseOutline (PPT generator)', () => {
  it('splits by --- into slides with title and bullets', () => {
    const text = `Slide One
- point a
- point b
---
Slide Two
- only one`
    const slides = parseOutline(text)
    expect(slides).toHaveLength(2)
    expect(slides[0].title).toBe('Slide One')
    expect(slides[0].bullets).toEqual(['point a', 'point b'])
    expect(slides[1].title).toBe('Slide Two')
    expect(slides[1].bullets).toEqual(['only one'])
  })

  it('strips bullet prefix - and •', () => {
    const text = `Title
- dash
• bullet`
    const slides = parseOutline(text)
    expect(slides[0].bullets).toEqual(['dash', 'bullet'])
  })

  it('returns empty array for empty or whitespace input', () => {
    expect(parseOutline('')).toEqual([])
    expect(parseOutline('   \n  \n')).toEqual([])
  })

  it('single block without ---', () => {
    const text = `Single
- a
- b`
    const slides = parseOutline(text)
    expect(slides).toHaveLength(1)
    expect(slides[0].title).toBe('Single')
    expect(slides[0].bullets).toEqual(['a', 'b'])
  })

  it('title-only slide has empty bullets', () => {
    const text = `Only Title
---
Next
- bullet`
    const slides = parseOutline(text)
    expect(slides).toHaveLength(2)
    expect(slides[0].title).toBe('Only Title')
    expect(slides[0].bullets).toEqual([])
    expect(slides[1].title).toBe('Next')
    expect(slides[1].bullets).toEqual(['bullet'])
  })
})
