/** MIME 类型 ↔ 扩展名速查。零依赖纯函数，数据内置。 */

export type MimeEntry = {
  mime: string
  /** 关联扩展名（不含点），第一个为首选 */
  ext: string[]
  /** 顶层类别 */
  category: 'image' | 'text' | 'application' | 'audio' | 'video' | 'font'
}

export const MIME_TABLE: MimeEntry[] = [
  // image
  { mime: 'image/png', ext: ['png'], category: 'image' },
  { mime: 'image/jpeg', ext: ['jpg', 'jpeg'], category: 'image' },
  { mime: 'image/gif', ext: ['gif'], category: 'image' },
  { mime: 'image/webp', ext: ['webp'], category: 'image' },
  { mime: 'image/svg+xml', ext: ['svg'], category: 'image' },
  { mime: 'image/avif', ext: ['avif'], category: 'image' },
  { mime: 'image/x-icon', ext: ['ico'], category: 'image' },
  { mime: 'image/bmp', ext: ['bmp'], category: 'image' },
  { mime: 'image/tiff', ext: ['tif', 'tiff'], category: 'image' },
  { mime: 'image/heic', ext: ['heic'], category: 'image' },
  // text
  { mime: 'text/plain', ext: ['txt', 'text', 'log'], category: 'text' },
  { mime: 'text/html', ext: ['html', 'htm'], category: 'text' },
  { mime: 'text/css', ext: ['css'], category: 'text' },
  { mime: 'text/csv', ext: ['csv'], category: 'text' },
  { mime: 'text/markdown', ext: ['md', 'markdown'], category: 'text' },
  { mime: 'text/calendar', ext: ['ics'], category: 'text' },
  // application
  { mime: 'application/json', ext: ['json'], category: 'application' },
  { mime: 'application/ld+json', ext: ['jsonld'], category: 'application' },
  { mime: 'application/xml', ext: ['xml'], category: 'application' },
  { mime: 'application/javascript', ext: ['js', 'mjs'], category: 'application' },
  { mime: 'application/pdf', ext: ['pdf'], category: 'application' },
  { mime: 'application/zip', ext: ['zip'], category: 'application' },
  { mime: 'application/gzip', ext: ['gz'], category: 'application' },
  { mime: 'application/x-tar', ext: ['tar'], category: 'application' },
  { mime: 'application/x-7z-compressed', ext: ['7z'], category: 'application' },
  { mime: 'application/wasm', ext: ['wasm'], category: 'application' },
  { mime: 'application/octet-stream', ext: ['bin'], category: 'application' },
  { mime: 'application/vnd.ms-excel', ext: ['xls'], category: 'application' },
  { mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', ext: ['xlsx'], category: 'application' },
  { mime: 'application/msword', ext: ['doc'], category: 'application' },
  { mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', ext: ['docx'], category: 'application' },
  { mime: 'application/vnd.ms-fontobject', ext: ['eot'], category: 'application' },
  // audio
  { mime: 'audio/mpeg', ext: ['mp3'], category: 'audio' },
  { mime: 'audio/ogg', ext: ['ogg', 'oga'], category: 'audio' },
  { mime: 'audio/wav', ext: ['wav'], category: 'audio' },
  { mime: 'audio/webm', ext: ['weba'], category: 'audio' },
  { mime: 'audio/aac', ext: ['aac'], category: 'audio' },
  { mime: 'audio/flac', ext: ['flac'], category: 'audio' },
  // video
  { mime: 'video/mp4', ext: ['mp4', 'm4v'], category: 'video' },
  { mime: 'video/webm', ext: ['webm'], category: 'video' },
  { mime: 'video/ogg', ext: ['ogv'], category: 'video' },
  { mime: 'video/quicktime', ext: ['mov'], category: 'video' },
  { mime: 'video/x-msvideo', ext: ['avi'], category: 'video' },
  { mime: 'video/x-matroska', ext: ['mkv'], category: 'video' },
  // font
  { mime: 'font/woff', ext: ['woff'], category: 'font' },
  { mime: 'font/woff2', ext: ['woff2'], category: 'font' },
  { mime: 'font/ttf', ext: ['ttf'], category: 'font' },
  { mime: 'font/otf', ext: ['otf'], category: 'font' },
]

export const CATEGORIES = ['image', 'text', 'application', 'audio', 'video', 'font'] as const

function normExt(input: string): string {
  return input.trim().toLowerCase().replace(/^.*\./, '').replace(/^\./, '')
}

/** 扩展名（或含点 / 文件名）→ MIME。未知返回 application/octet-stream。 */
export function extToMime(input: string): { mime: string; known: boolean } {
  const ext = normExt(input)
  if (!ext) return { mime: 'application/octet-stream', known: false }
  for (const e of MIME_TABLE) {
    if (e.ext.includes(ext)) return { mime: e.mime, known: true }
  }
  return { mime: 'application/octet-stream', known: false }
}

/** MIME（容忍参数如 `; charset=utf-8`）→ 扩展名列表。 */
export function mimeToExt(input: string): string[] {
  const mime = input.trim().toLowerCase().split(';')[0].trim()
  for (const e of MIME_TABLE) {
    if (e.mime === mime) return e.ext
  }
  return []
}

/** 搜索：按 mime 子串、扩展名、类别过滤。 */
export function search(query: string, category: typeof CATEGORIES[number] | 'all' = 'all'): MimeEntry[] {
  const q = query.trim().toLowerCase().replace(/^\./, '')
  return MIME_TABLE.filter((e) => {
    if (category !== 'all' && e.category !== category) return false
    if (!q) return true
    if (e.mime.toLowerCase().includes(q)) return true
    if (e.ext.some((x) => x.includes(q))) return true
    return false
  })
}
