/**
 * Canvas resize utility: proportional centered draw.
 *
 * Caller provides an HTMLCanvasElement or compatible OffscreenCanvas as source;
 * we only rely on the 2D context drawImage(src, dx, dy, dw, dh) call.
 */

export interface ResizeOptions {
  /** Output side length (square) */
  size: number
  /** Background fill, null/undefined means transparent */
  background?: string | null
  /**
   * Inner padding ratio [0, 0.5)
   * 0    -> fills the whole canvas
   * 0.1  -> reserves 10% safe-area on each side
   */
  padding?: number
}

type AnyCanvas = HTMLCanvasElement | OffscreenCanvas

interface DrawSource {
  width: number
  height: number
}

/** Create a target-size canvas (HTMLCanvasElement so we can use toBlob) */
export function createOutputCanvas(size: number): HTMLCanvasElement {
  const c = document.createElement('canvas')
  c.width = size
  c.height = size
  return c
}

export function resizeOnto(
  out: AnyCanvas,
  src: CanvasImageSource & DrawSource,
  opts: ResizeOptions,
): void {
  const ctx = out.getContext('2d') as
    | CanvasRenderingContext2D
    | OffscreenCanvasRenderingContext2D
    | null
  if (!ctx) throw new Error('resizeOnto: 2D context not available')

  const size = opts.size
  const pad = Math.max(0, Math.min(opts.padding ?? 0, 0.49))
  const inner = Math.round(size * (1 - pad * 2))

  ctx.clearRect(0, 0, size, size)

  if (opts.background) {
    ctx.fillStyle = opts.background
    ctx.fillRect(0, 0, size, size)
  }

  if (!src.width || !src.height) return

  const scale = Math.min(inner / src.width, inner / src.height)
  const drawW = Math.max(1, Math.round(src.width * scale))
  const drawH = Math.max(1, Math.round(src.height * scale))
  const dx = Math.round((size - drawW) / 2)
  const dy = Math.round((size - drawH) / 2)

  ctx.imageSmoothingEnabled = true
  ;(ctx as CanvasRenderingContext2D).imageSmoothingQuality = 'high'
  ctx.drawImage(src as CanvasImageSource, dx, dy, drawW, drawH)
}

/** Output canvas as PNG Uint8Array (async, used for ICO embedding) */
export async function canvasToPngBytes(canvas: HTMLCanvasElement): Promise<Uint8Array> {
  const blob: Blob | null = await new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b), 'image/png'),
  )
  if (!blob) throw new Error('canvasToPngBytes: toBlob returned null')
  const buf = await blob.arrayBuffer()
  return new Uint8Array(buf)
}
