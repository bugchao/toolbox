/**
 * Strip every form of metadata (EXIF / IPTC / XMP / ICC / embedded thumbnails)
 * from an image by re-encoding it through a canvas.
 *
 * This is the cheapest reliable strategy in a browser: anything the canvas
 * imaging pipeline does not actively preserve simply doesn't survive the
 * `drawImage` + `toBlob` round-trip.
 */

export type StripOutputFormat = 'jpeg' | 'png' | 'auto'

export interface StripOptions {
  /** Output container; `auto` keeps the source mime when supported. */
  format?: StripOutputFormat
  /** Quality 0..1, only used for JPEG/WebP. */
  quality?: number
}

const DEFAULT_QUALITY = 0.95

function resolveOutputMime(sourceMime: string, requested: StripOutputFormat): string {
  if (requested === 'jpeg') return 'image/jpeg'
  if (requested === 'png') return 'image/png'
  // auto: preserve transparency-capable formats, otherwise re-encode as JPEG.
  const lower = (sourceMime || '').toLowerCase()
  if (lower === 'image/png') return 'image/png'
  if (lower === 'image/webp') return 'image/webp'
  if (lower === 'image/gif') return 'image/png' // GIF → flatten to PNG to preserve alpha
  return 'image/jpeg'
}

function loadImage(file: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    const cleanup = () => {
      // Schedule revoke after the current microtask so the browser has time to
      // pick up the image bytes.
      setTimeout(() => URL.revokeObjectURL(url), 0)
    }
    img.onload = () => {
      cleanup()
      resolve(img)
    }
    img.onerror = () => {
      cleanup()
      reject(new Error('stripImageMetadata: failed to decode image'))
    }
    img.src = url
  })
}

function canvasToBlob(canvas: HTMLCanvasElement, mime: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (!b) {
          reject(new Error('stripImageMetadata: toBlob returned null'))
          return
        }
        resolve(b)
      },
      mime,
      quality,
    )
  })
}

export async function stripImageMetadata(
  file: File | Blob,
  opts: StripOptions = {},
): Promise<Blob> {
  const format = opts.format ?? 'auto'
  const quality = opts.quality ?? DEFAULT_QUALITY
  const sourceMime = (file as File).type ?? ''
  const outputMime = resolveOutputMime(sourceMime, format)

  const img = await loadImage(file)
  const width = img.naturalWidth || img.width || 1
  const height = img.naturalHeight || img.height || 1

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('stripImageMetadata: 2D context unavailable')

  // For JPEG output we have no alpha — paint white so transparent pixels do
  // not become black after re-encoding.
  if (outputMime === 'image/jpeg') {
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, width, height)
  } else {
    ctx.clearRect(0, 0, width, height)
  }
  ctx.drawImage(img, 0, 0, width, height)

  return canvasToBlob(canvas, outputMime, quality)
}

/**
 * Determine which file extension we should write for a given clean output.
 * Mirrors `resolveOutputMime` so the rest of the UI can label download links
 * consistently.
 */
export function pickOutputExtension(sourceMime: string, requested: StripOutputFormat = 'auto'): string {
  const mime = resolveOutputMime(sourceMime, requested)
  switch (mime) {
    case 'image/png':
      return 'png'
    case 'image/webp':
      return 'webp'
    case 'image/jpeg':
    default:
      return 'jpg'
  }
}
