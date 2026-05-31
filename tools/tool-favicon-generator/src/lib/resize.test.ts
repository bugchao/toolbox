import { describe, it, expect, beforeAll } from 'vitest'
import { createOutputCanvas, resizeOnto } from './resize'

// jsdom HTMLCanvasElement.getContext is not implemented. Install a minimal
// 2D context stub so our pure-layout resize() logic can be exercised.
beforeAll(() => {
  function makeStubCtx() {
    return {
      fillStyle: '',
      imageSmoothingEnabled: false,
      imageSmoothingQuality: 'low',
      clearRect() {},
      fillRect() {},
      drawImage() {},
    } as unknown as CanvasRenderingContext2D
  }
  // Patch HTMLCanvasElement.prototype.getContext so all canvases return our stub.
  ;(HTMLCanvasElement.prototype as unknown as { getContext: () => unknown }).getContext = () => makeStubCtx()
})

function makeSourceCanvas(w: number, h: number): HTMLCanvasElement {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  return c
}

describe('createOutputCanvas', () => {
  it('creates a square canvas with the requested size', () => {
    const c = createOutputCanvas(16)
    expect(c.width).toBe(16)
    expect(c.height).toBe(16)
  })

  it('creates 32x32 when asked', () => {
    const c = createOutputCanvas(32)
    expect(c.width).toBe(32)
    expect(c.height).toBe(32)
  })
})

describe('resizeOnto - layout math', () => {
  it('leaves canvas size unchanged after drawing', () => {
    const out = createOutputCanvas(16)
    const src = makeSourceCanvas(512, 512)
    resizeOnto(out, src, { size: 16 })
    expect(out.width).toBe(16)
    expect(out.height).toBe(16)
  })

  it('supports a 32x32 output', () => {
    const out = createOutputCanvas(32)
    const src = makeSourceCanvas(256, 256)
    resizeOnto(out, src, { size: 32, background: null })
    expect(out.width).toBe(32)
    expect(out.height).toBe(32)
  })

  it('honors maskable padding (no throw, output size stays)', () => {
    const out = createOutputCanvas(48)
    const src = makeSourceCanvas(512, 512)
    resizeOnto(out, src, { size: 48, padding: 0.1 })
    expect(out.width).toBe(48)
    expect(out.height).toBe(48)
  })

  it('records every drawImage call we issue', () => {
    const calls: number[][] = []
    const stubCtx = {
      fillStyle: '',
      imageSmoothingEnabled: false,
      imageSmoothingQuality: 'low',
      clearRect() {},
      fillRect() {},
      drawImage(_src: unknown, dx: number, dy: number, dw: number, dh: number) {
        calls.push([dx, dy, dw, dh])
      },
    }
    const fakeOut = { getContext: () => stubCtx } as unknown as HTMLCanvasElement
    const fakeSrc = { width: 400, height: 200 } as unknown as HTMLImageElement
    resizeOnto(fakeOut, fakeSrc, { size: 32 })
    expect(calls).toHaveLength(1)
    const [dx, dy, dw, dh] = calls[0]
    // Aspect 2:1 fit inside 32: width=32, height=16, centered vertically.
    expect(dw).toBe(32)
    expect(dh).toBe(16)
    expect(dx).toBe(0)
    expect(dy).toBe(8)
  })

  it('throws if the 2D context is missing', () => {
    const broken = { getContext: () => null } as unknown as HTMLCanvasElement
    const fakeSrc = { width: 8, height: 8 } as unknown as HTMLImageElement
    expect(() => resizeOnto(broken, fakeSrc, { size: 8 })).toThrow()
  })
})
