import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { pickOutputExtension, stripImageMetadata } from './strip'

// jsdom does not implement <canvas> rendering or HTMLImageElement load events.
// Patch both prototypes so stripImageMetadata can run end-to-end without
// needing a real graphics backend.
type ImageStub = HTMLImageElement & { _src?: string }

const origGetContext = HTMLCanvasElement.prototype.getContext
const origToBlob = HTMLCanvasElement.prototype.toBlob
const origSrcDescriptor = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src')

beforeAll(() => {
  // Minimal 2D context stub — we only call clearRect/fillRect/drawImage.
  ;(HTMLCanvasElement.prototype as unknown as { getContext: () => unknown }).getContext = function () {
    return {
      fillStyle: '',
      imageSmoothingEnabled: false,
      imageSmoothingQuality: 'low',
      clearRect() {},
      fillRect() {},
      drawImage() {},
    }
  }

  // toBlob returns a small Blob with the requested mime type.
  ;(HTMLCanvasElement.prototype as unknown as {
    toBlob: (cb: (b: Blob | null) => void, type?: string) => void
  }).toBlob = function (cb, type) {
    const mime = type || 'image/png'
    // 8-byte fake payload so callers see a non-empty blob.
    const blob = new Blob([new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8])], { type: mime })
    setTimeout(() => cb(blob), 0)
  }

  // Make image "load" succeed synchronously by intercepting the src setter.
  Object.defineProperty(HTMLImageElement.prototype, 'src', {
    configurable: true,
    set(this: ImageStub, value: string) {
      this._src = value
      // Provide a default natural size so canvas dimensions are non-zero.
      Object.defineProperty(this, 'naturalWidth', { value: 100, configurable: true })
      Object.defineProperty(this, 'naturalHeight', { value: 80, configurable: true })
      setTimeout(() => {
        const handler = this.onload as ((this: GlobalEventHandlers, ev: Event) => unknown) | null
        if (handler) handler.call(this, new Event('load'))
      }, 0)
    },
    get(this: ImageStub) {
      return this._src ?? ''
    },
  })

  // URL.createObjectURL is not implemented in jsdom; install a no-op shim.
  if (typeof URL.createObjectURL !== 'function') {
    ;(URL as unknown as { createObjectURL: (b: Blob) => string }).createObjectURL = () => 'blob:stub'
  }
  if (typeof URL.revokeObjectURL !== 'function') {
    ;(URL as unknown as { revokeObjectURL: (s: string) => void }).revokeObjectURL = () => {}
  }
})

afterAll(() => {
  HTMLCanvasElement.prototype.getContext = origGetContext
  HTMLCanvasElement.prototype.toBlob = origToBlob
  if (origSrcDescriptor) {
    Object.defineProperty(HTMLImageElement.prototype, 'src', origSrcDescriptor)
  }
})

function makeFile(mime = 'image/jpeg'): File {
  // The actual bytes never get decoded thanks to our Image stub.
  return new File([new Uint8Array([0, 0, 0, 0])], 'photo.jpg', { type: mime })
}

describe('stripImageMetadata', () => {
  it('produces a non-empty Blob', async () => {
    const out = await stripImageMetadata(makeFile())
    expect(out.size).toBeGreaterThan(0)
  })

  it('emits image/jpeg by default for jpeg input', async () => {
    const out = await stripImageMetadata(makeFile('image/jpeg'))
    expect(out.type).toBe('image/jpeg')
  })

  it('forces image/png output when format=png', async () => {
    const out = await stripImageMetadata(makeFile('image/jpeg'), { format: 'png' })
    expect(out.type).toBe('image/png')
  })

  it('keeps source mime under format=auto for png', async () => {
    const out = await stripImageMetadata(makeFile('image/png'), { format: 'auto' })
    expect(out.type).toBe('image/png')
  })

  it('keeps source mime under format=auto for webp', async () => {
    const out = await stripImageMetadata(makeFile('image/webp'), { format: 'auto' })
    expect(out.type).toBe('image/webp')
  })

  it('falls back to image/jpeg for HEIC under format=auto', async () => {
    const out = await stripImageMetadata(makeFile('image/heic'), { format: 'auto' })
    expect(out.type).toBe('image/jpeg')
  })
})

describe('pickOutputExtension', () => {
  it('maps formats to file extensions', () => {
    expect(pickOutputExtension('image/jpeg', 'auto')).toBe('jpg')
    expect(pickOutputExtension('image/png', 'auto')).toBe('png')
    expect(pickOutputExtension('image/webp', 'auto')).toBe('webp')
    expect(pickOutputExtension('image/heic', 'auto')).toBe('jpg')
    expect(pickOutputExtension('image/jpeg', 'png')).toBe('png')
    expect(pickOutputExtension('image/png', 'jpeg')).toBe('jpg')
  })
})
