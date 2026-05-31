import { describe, it, expect } from 'vitest'
import { addLayer, createLayer, moveLayer, removeLayer, updateLayer } from './layers'

describe('addLayer', () => {
  it('returns a new array with one more layer', () => {
    const before = [createLayer({ id: 'a' })]
    const after = addLayer(before)
    expect(after).toHaveLength(2)
    expect(before).toHaveLength(1) // original untouched (immutable)
  })
})

describe('removeLayer', () => {
  it('removes the layer by id', () => {
    const layers = [createLayer({ id: 'a' }), createLayer({ id: 'b' })]
    const result = removeLayer(layers, 'a')
    expect(result.map((l) => l.id)).toEqual(['b'])
  })
  it('is a no-op for unknown id', () => {
    const layers = [createLayer({ id: 'a' })]
    expect(removeLayer(layers, 'zzz')).toEqual(layers)
  })
})

describe('updateLayer', () => {
  it('patches the matching layer only', () => {
    const layers = [createLayer({ id: 'a', y: 4 }), createLayer({ id: 'b', y: 4 })]
    const result = updateLayer(layers, 'a', { y: 12 })
    expect(result.find((l) => l.id === 'a')!.y).toBe(12)
    expect(result.find((l) => l.id === 'b')!.y).toBe(4)
  })
})

describe('moveLayer', () => {
  it('moves up', () => {
    const layers = [createLayer({ id: 'a' }), createLayer({ id: 'b' }), createLayer({ id: 'c' })]
    const result = moveLayer(layers, 'b', 'up')
    expect(result.map((l) => l.id)).toEqual(['b', 'a', 'c'])
  })
  it('moves down', () => {
    const layers = [createLayer({ id: 'a' }), createLayer({ id: 'b' }), createLayer({ id: 'c' })]
    const result = moveLayer(layers, 'b', 'down')
    expect(result.map((l) => l.id)).toEqual(['a', 'c', 'b'])
  })
  it('is a no-op at top boundary', () => {
    const layers = [createLayer({ id: 'a' }), createLayer({ id: 'b' })]
    expect(moveLayer(layers, 'a', 'up')).toEqual(layers)
  })
  it('is a no-op at bottom boundary', () => {
    const layers = [createLayer({ id: 'a' }), createLayer({ id: 'b' })]
    expect(moveLayer(layers, 'b', 'down')).toEqual(layers)
  })
  it('is a no-op for unknown id', () => {
    const layers = [createLayer({ id: 'a' })]
    expect(moveLayer(layers, 'zzz', 'up')).toEqual(layers)
  })
})
