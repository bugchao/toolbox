// 图片启发式特征
import type { Feature } from './textFeatures'

const AI_KEYWORDS = [
  'stable diffusion',
  'stable-diffusion',
  'sdxl',
  'midjourney',
  'dall·e',
  'dalle',
  'parameters',
  'sampler',
  'cfg scale',
  'sd ',
  'comfyui',
  'novelai',
  'leonardo',
  'firefly',
  'imagen',
]

const AI_SIZES = new Set(['512x512', '768x768', '1024x1024', '512x768', '768x512', '1024x1536', '1536x1024'])

// remap helper（与 textFeatures 保持一致）
function remap(v: number, from0: number, from1: number, to0: number, to1: number): number {
  if (from0 === from1) return (to0 + to1) / 2
  const t = Math.max(0, Math.min(1, (v - from0) / (from1 - from0)))
  return to0 + (to1 - to0) * t
}

export type ImageAnalysis = {
  width: number
  height: number
  format: 'png' | 'jpeg' | 'webp' | 'gif' | 'unknown'
  metadataHits: string[]
  features: Feature[]
}

/** 从 PNG 文件的 textual chunks 抽取所有 key=value 字符串 */
function readPngTextChunks(bytes: Uint8Array): string[] {
  const out: string[] = []
  const sig = [137, 80, 78, 71, 13, 10, 26, 10]
  for (let i = 0; i < 8; i++) if (bytes[i] !== sig[i]) return out
  let off = 8
  const decoder = new TextDecoder()
  while (off < bytes.length - 8) {
    const len =
      (bytes[off] << 24) | (bytes[off + 1] << 16) | (bytes[off + 2] << 8) | bytes[off + 3]
    const type = decoder.decode(bytes.slice(off + 4, off + 8))
    const dataStart = off + 8
    const dataEnd = dataStart + len
    if (dataEnd > bytes.length) break
    if (type === 'tEXt' || type === 'iTXt') {
      // tEXt: key\0value
      const buf = bytes.slice(dataStart, dataEnd)
      let zero = buf.indexOf(0)
      if (zero === -1) zero = 0
      const key = decoder.decode(buf.slice(0, zero))
      // iTXt: key\0comp_flag\0comp_method\0lang\0translated\0value (这里粗略截取)
      const value = decoder.decode(buf.slice(zero + 1))
      out.push(`${key}=${value}`)
    } else if (type === 'IEND') {
      break
    }
    off = dataEnd + 4
  }
  return out
}

/** 从 JPEG 抽取 EXIF "Software" 字段（粗略） */
function readJpegSoftware(bytes: Uint8Array): string[] {
  const out: string[] = []
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) return out
  let off = 2
  while (off < bytes.length - 4) {
    if (bytes[off] !== 0xff) break
    const marker = bytes[off + 1]
    const segLen = (bytes[off + 2] << 8) | bytes[off + 3]
    if (marker === 0xe1 && segLen > 8) {
      // APP1 (Exif)
      const seg = bytes.slice(off + 4, off + 2 + segLen)
      const ascii = new TextDecoder('ascii', { fatal: false }).decode(seg)
      // 抽取 Software 关键字段附近的字符串
      const idx = ascii.toLowerCase().indexOf('software')
      if (idx >= 0) out.push(ascii.slice(idx, Math.min(ascii.length, idx + 80)))
    }
    if (marker === 0xda) break // SOS，往后就是图像数据
    off += 2 + segLen
  }
  return out
}

function detectFormat(bytes: Uint8Array): ImageAnalysis['format'] {
  if (bytes.length >= 8 && bytes[0] === 137 && bytes[1] === 80) return 'png'
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8) return 'jpeg'
  if (
    bytes.length >= 12 &&
    String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3]) === 'RIFF' &&
    String.fromCharCode(bytes[8], bytes[9], bytes[10], bytes[11]) === 'WEBP'
  )
    return 'webp'
  if (bytes.length >= 3 && bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46)
    return 'gif'
  return 'unknown'
}

function extractMetadataHits(bytes: Uint8Array, format: ImageAnalysis['format']): string[] {
  const chunks: string[] = []
  if (format === 'png') chunks.push(...readPngTextChunks(bytes))
  if (format === 'jpeg') chunks.push(...readJpegSoftware(bytes))
  const hits: string[] = []
  for (const c of chunks) {
    const lower = c.toLowerCase()
    for (const kw of AI_KEYWORDS) {
      if (lower.includes(kw)) {
        hits.push(c.slice(0, 120))
        break
      }
    }
  }
  return hits
}

/** 直方图熵：低/极高均偏向 AI 生成（过于规整或过于杂乱） */
function histogramEntropy(imageData: ImageData): number {
  const bins = new Array<number>(256).fill(0)
  const d = imageData.data
  for (let i = 0; i < d.length; i += 4) {
    // 灰度近似
    const y = (d[i] * 299 + d[i + 1] * 587 + d[i + 2] * 114) / 1000
    bins[Math.min(255, Math.max(0, Math.round(y)))]++
  }
  const n = imageData.width * imageData.height
  let h = 0
  for (const c of bins) {
    if (c === 0) continue
    const p = c / n
    h -= p * Math.log2(p)
  }
  return h
}

/** Sobel 边缘比：边缘像素占比，AI 平滑图通常偏低 */
function edgeRatio(imageData: ImageData): number {
  const { width, height, data } = imageData
  const gray = new Uint8Array(width * height)
  for (let i = 0, j = 0; i < data.length; i += 4, j++) {
    gray[j] = (data[i] * 299 + data[i + 1] * 587 + data[i + 2] * 114) / 1000
  }
  let edgeCount = 0
  let total = 0
  // 步长 2 抽样降本
  for (let y = 1; y < height - 1; y += 2) {
    for (let x = 1; x < width - 1; x += 2) {
      const i = y * width + x
      const gx =
        -gray[i - width - 1] -
        2 * gray[i - 1] -
        gray[i + width - 1] +
        gray[i - width + 1] +
        2 * gray[i + 1] +
        gray[i + width + 1]
      const gy =
        -gray[i - width - 1] -
        2 * gray[i - width] -
        gray[i - width + 1] +
        gray[i + width - 1] +
        2 * gray[i + width] +
        gray[i + width + 1]
      const mag = Math.sqrt(gx * gx + gy * gy)
      if (mag > 60) edgeCount++
      total++
    }
  }
  return total === 0 ? 0 : edgeCount / total
}

export async function analyzeImage(file: File): Promise<ImageAnalysis> {
  const arrayBuf = await file.arrayBuffer()
  const bytes = new Uint8Array(arrayBuf)
  const format = detectFormat(bytes)

  // 解码以拿到尺寸 + ImageData
  const url = URL.createObjectURL(file)
  let width = 0
  let height = 0
  let imageData: ImageData | null = null
  try {
    const img = await loadImage(url)
    width = img.naturalWidth
    height = img.naturalHeight
    imageData = drawAndSample(img)
  } finally {
    URL.revokeObjectURL(url)
  }

  const metadataHits = extractMetadataHits(bytes, format)
  const features: Feature[] = []

  // 1) 元数据强信号
  features.push({
    key: 'metadata_hits',
    rawLabel: 'AI metadata keywords matched',
    value: metadataHits.length === 0 ? 'none' : `${metadataHits.length} hit(s)`,
    contribution: metadataHits.length > 0 ? 95 : 45,
    weight: 0.3,
  })

  // 2) 典型 AI 出图尺寸
  const sizeKey = `${width}x${height}`
  features.push({
    key: 'ai_size',
    rawLabel: 'Resolution matches common AI presets',
    value: sizeKey,
    contribution: AI_SIZES.has(sizeKey) ? 80 : 45,
    weight: 0.15,
  })

  if (imageData) {
    // 3) 直方图熵
    const he = histogramEntropy(imageData)
    features.push({
      key: 'hist_entropy',
      rawLabel: 'Luminance histogram entropy (bits)',
      value: he.toFixed(2),
      // 人拍照片常 6.5–7.5；AI 出图常更"平滑"在 4.5–6.5；过低偏 AI
      contribution: Math.round(remap(he, 7.5, 5.0, 25, 80)),
      weight: 0.2,
    })

    // 4) 边缘比
    const er = edgeRatio(imageData)
    features.push({
      key: 'edge_ratio',
      rawLabel: 'Edge density',
      value: er.toFixed(3),
      // 真实照片 0.05–0.25；AI 出图（写实风）偏低 0.02–0.08
      contribution: Math.round(remap(er, 0.18, 0.04, 25, 80)),
      weight: 0.2,
    })
  } else {
    features.push({
      key: 'decode_failed',
      rawLabel: 'Pixel decode',
      value: 'failed',
      contribution: 50,
      weight: 0.1,
    })
  }

  // 5) 文件格式：PNG（带 alpha + 大量 AI 工具默认导出 PNG）轻偏 AI；JPEG 轻偏摄影
  features.push({
    key: 'format_bias',
    rawLabel: 'File format prior',
    value: format,
    contribution: format === 'png' ? 60 : format === 'jpeg' ? 40 : 50,
    weight: 0.15,
  })

  return { width, height, format, metadataHits, features }
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = (e) => reject(e)
    img.src = url
  })
}

const MAX_SAMPLE = 384

function drawAndSample(img: HTMLImageElement): ImageData | null {
  const scale = Math.min(1, MAX_SAMPLE / Math.max(img.naturalWidth, img.naturalHeight))
  const w = Math.max(1, Math.round(img.naturalWidth * scale))
  const h = Math.max(1, Math.round(img.naturalHeight * scale))
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return null
  ctx.drawImage(img, 0, 0, w, h)
  try {
    return ctx.getImageData(0, 0, w, h)
  } catch {
    return null
  }
}
