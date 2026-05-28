// 把图片列表 + 选项 → PDF Blob
import jsPDF from 'jspdf'
import {
  MARGIN_MM,
  type MarginKey,
  type Orientation,
  type PaperKey,
  pageDimensions,
} from './pageSize'
import { containFit, slotBoxes, type PerPage } from './layout'

export type ImageItem = {
  id: string
  file: File
  /** 顺时针旋转角度 0/90/180/270 */
  rotation: number
  /** 解码后的原始像素尺寸 */
  naturalWidth: number
  naturalHeight: number
}

export type BuildOptions = {
  paper: PaperKey
  orientation: Orientation
  margin: MarginKey
  perPage: PerPage
}

function inferFormat(file: File): 'JPEG' | 'PNG' | 'WEBP' {
  const t = file.type.toLowerCase()
  if (t.includes('png')) return 'PNG'
  if (t.includes('webp')) return 'WEBP'
  return 'JPEG'
}

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(r.result as string)
    r.onerror = () => reject(r.error)
    r.readAsDataURL(file)
  })
}

/**
 * 把 ImageItem[] 按选项打包成 PDF blob。
 * - 每页 perPage 张；不足时最后一页留空槽。
 * - paper='fit' 且 perPage=1 时，页面尺寸跟随该图比例。
 */
export async function buildPdf(items: ImageItem[], options: BuildOptions): Promise<Blob> {
  if (items.length === 0) throw new Error('no images')
  const margin = MARGIN_MM[options.margin]

  // 取首图作占位决定第一页尺寸；后续每页根据当页第一张（fit 模式）
  const firstFit = options.paper === 'fit' && options.perPage === 1 ? items[0] : null
  const firstDim = pageDimensions(
    options.paper,
    options.orientation,
    firstFit
      ? rotatedDims(firstFit)
      : undefined,
  )

  const doc = new jsPDF({
    unit: 'mm',
    format: [firstDim.width, firstDim.height],
    orientation: firstDim.width >= firstDim.height ? 'landscape' : 'portrait',
  })

  const pages = Math.ceil(items.length / options.perPage)
  for (let p = 0; p < pages; p++) {
    if (p > 0) {
      const first = items[p * options.perPage]
      const dim = pageDimensions(
        options.paper,
        options.orientation,
        options.paper === 'fit' && options.perPage === 1 ? rotatedDims(first) : undefined,
      )
      doc.addPage([dim.width, dim.height], dim.width >= dim.height ? 'landscape' : 'portrait')
    }
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const slots = slotBoxes(pageWidth, pageHeight, margin, options.perPage)
    for (let s = 0; s < options.perPage; s++) {
      const idx = p * options.perPage + s
      if (idx >= items.length) break
      const it = items[idx]
      const { width: rw, height: rh } = rotatedDims(it)
      const target = containFit(slots[s], rw, rh)
      const dataUrl = await fileToDataUrl(it.file)
      const fmt = inferFormat(it.file)
      doc.addImage(dataUrl, fmt, target.x, target.y, target.w, target.h, undefined, 'FAST', it.rotation)
    }
  }

  return doc.output('blob')
}

/** 旋转后图像的有效宽高（90°/270° 时交换） */
function rotatedDims(it: ImageItem): { width: number; height: number } {
  const r = ((it.rotation % 360) + 360) % 360
  if (r === 90 || r === 270) {
    return { width: it.naturalHeight, height: it.naturalWidth }
  }
  return { width: it.naturalWidth, height: it.naturalHeight }
}

export const __testing = { rotatedDims }
