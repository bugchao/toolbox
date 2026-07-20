import { padJpeg } from './pad-jpeg'
import { padPng } from './pad-png'
import { padWebp } from './pad-webp'
import { nextQuality } from './quality-search'
import type { OutputFormat, ResizeResult } from './types'

const MAX_QUALITY_ITERATIONS = 20
const MAX_SCALE_ITERATIONS = 12

export function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image'))
    }
    img.src = url
  })
}

function resolveMime(format: OutputFormat, originalType: string): string {
  if (format === 'jpeg') return 'image/jpeg'
  if (format === 'png') return 'image/png'
  if (format === 'webp') return 'image/webp'
  return originalType.startsWith('image/') ? originalType : 'image/png'
}

function padToTarget(mime: string, bytes: Uint8Array, targetSize: number): Uint8Array {
  if (mime === 'image/jpeg') return padJpeg(bytes, targetSize)
  if (mime === 'image/png') return padPng(bytes, targetSize)
  if (mime === 'image/webp') return padWebp(bytes, targetSize)
  throw new Error(`Padding not supported for ${mime}`)
}

function canvasToBytes(canvas: HTMLCanvasElement, mime: string, quality?: number): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      async (blob) => {
        if (!blob) return reject(new Error('Canvas encoding failed'))
        resolve(new Uint8Array(await blob.arrayBuffer()))
      },
      mime,
      quality,
    )
  })
}

function drawToCanvas(img: HTMLImageElement, width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D context unavailable')
  ctx.drawImage(img, 0, 0, width, height)
  return canvas
}

/**
 * 把图片编码到精确/尽量逼近的目标字节数。策略按实际编码结果的大小驱动，而非提前假定方向：
 * - 最高质量编码仍小于目标：直接安全填充到精确目标（内容/分辨率不变）。
 * - 大于目标且格式支持质量参数（JPEG/WEBP）：二分搜索 quality 逼近目标。
 * - 大于目标且格式无损（PNG）：按比例缩小分辨率逼近目标，标记为近似值。
 */
export async function encodeToTarget(img: HTMLImageElement, format: OutputFormat, originalType: string, targetSize: number): Promise<ResizeResult> {
  const mime = resolveMime(format, originalType)
  const supportsQuality = mime === 'image/jpeg' || mime === 'image/webp'
  const canvas = drawToCanvas(img, img.naturalWidth, img.naturalHeight)

  let bytes = await canvasToBytes(canvas, mime, supportsQuality ? 1 : undefined)

  if (bytes.length < targetSize) {
    const padded = padToTarget(mime, bytes, targetSize)
    return { actualSize: padded.length, blob: new Blob([padded], { type: mime }), approximate: false }
  }
  if (bytes.length === targetSize) {
    return { actualSize: bytes.length, blob: new Blob([bytes], { type: mime }), approximate: false }
  }

  if (supportsQuality) {
    let low = 0
    let high = 1
    let quality = 0.5
    let best = bytes // 最高质量的结果，兜底
    for (let i = 0; i < MAX_QUALITY_ITERATIONS; i++) {
      bytes = await canvasToBytes(canvas, mime, quality)
      if (bytes.length <= targetSize) best = bytes
      const step = nextQuality(low, high, quality, bytes.length, targetSize)
      low = step.low
      high = step.high
      quality = step.quality
      if (step.done) break
    }
    return { actualSize: best.length, blob: new Blob([best], { type: mime }), approximate: false }
  }

  // PNG 等无损格式：没有质量旋钮，按比例缩小分辨率逼近目标（近似值）
  let scale = 1
  let best = bytes
  for (let i = 0; i < MAX_SCALE_ITERATIONS && best.length > targetSize; i++) {
    scale *= 0.85
    const scaledCanvas = drawToCanvas(img, Math.max(1, Math.round(img.naturalWidth * scale)), Math.max(1, Math.round(img.naturalHeight * scale)))
    best = await canvasToBytes(scaledCanvas, mime)
  }
  return { actualSize: best.length, blob: new Blob([best], { type: mime }), approximate: true }
}
