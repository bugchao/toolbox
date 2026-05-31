import { describe, it, expect } from 'vitest'
import { PRESETS } from './presets'

describe('PRESETS', () => {
  it('all preset ids are unique', () => {
    const ids = PRESETS.map((p) => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('material-2 returns two layers (key + ambient)', () => {
    const p = PRESETS.find((p) => p.id === 'material-2')!
    const layers = p.build()
    expect(layers).toHaveLength(2)
    layers.forEach((l) => expect(l.inset).toBe(false))
  })

  it('neumorphism-light has a bright highlight and a darker bottom-right shadow', () => {
    const p = PRESETS.find((p) => p.id === 'neumorphism-light')!
    const layers = p.build()
    expect(layers).toHaveLength(2)
    // light highlight: white-ish color, negative offsets
    const highlight = layers.find((l) => l.color.toLowerCase() === '#ffffff')
    expect(highlight).toBeTruthy()
    expect(highlight!.x).toBeLessThan(0)
    expect(highlight!.y).toBeLessThan(0)
    // shadow: non-white color, positive offsets
    const shadow = layers.find((l) => l.color.toLowerCase() !== '#ffffff')
    expect(shadow).toBeTruthy()
    expect(shadow!.x).toBeGreaterThan(0)
    expect(shadow!.y).toBeGreaterThan(0)
  })

  it('glassmorphism preset is a single soft drop shadow', () => {
    const p = PRESETS.find((p) => p.id === 'glassmorphism')!
    const layers = p.build()
    expect(layers).toHaveLength(1)
    expect(layers[0].alpha).toBeLessThan(0.3)
    expect(layers[0].blur).toBeGreaterThanOrEqual(16)
  })

  it('material elevation increases shadow magnitude', () => {
    const m1 = PRESETS.find((p) => p.id === 'material-1')!.build()
    const m16 = PRESETS.find((p) => p.id === 'material-16')!.build()
    const total = (ls: { blur: number; y: number }[]) =>
      ls.reduce((s, l) => s + l.blur + l.y, 0)
    expect(total(m16)).toBeGreaterThan(total(m1))
  })
})
