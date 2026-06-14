/** 文件 ↔ Base64 编解码核心。纯函数 + 注入式 IO，全部可测。 */

/** Uint8Array → base64 字符串（分块处理避免 call-stack 爆）。 */
export function bytesToBase64(bytes: Uint8Array): string {
  const CHUNK = 0x8000
  let binary = ''
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK))
  }
  return btoa(binary)
}

/** base64 字符串 → Uint8Array。容错：剥空白 / 换行 / data URI 前缀。 */
export type DecodeResult =
  | { ok: true; bytes: Uint8Array; mime: string | null }
  | { ok: false; message: string }

const DATA_URI_RE = /^data:([^;,]+)?(;base64)?,/i

export function base64ToBytes(input: string): DecodeResult {
  let raw = input.trim()
  let mime: string | null = null

  // data URI 前缀剥离
  const m = raw.match(DATA_URI_RE)
  if (m) {
    mime = m[1] ?? null
    raw = raw.slice(m[0].length)
    if (!m[2]) {
      // 非 base64 data URI（URL-encoded 文本）
      try {
        const text = decodeURIComponent(raw)
        return { ok: true, bytes: new TextEncoder().encode(text), mime }
      } catch (e) {
        return { ok: false, message: (e as Error).message }
      }
    }
  }

  // 剥所有空白（换行 / 空格 / tab）
  raw = raw.replace(/\s+/g, '')
  if (!raw) return { ok: false, message: 'empty' }

  // URL-safe 变体归一
  raw = raw.replace(/-/g, '+').replace(/_/g, '/')
  // 补 padding
  const pad = raw.length % 4
  if (pad === 1) return { ok: false, message: 'invalid_length' }
  if (pad > 0) raw += '='.repeat(4 - pad)

  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(raw)) {
    return { ok: false, message: 'invalid_characters' }
  }

  try {
    const binary = atob(raw)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
    return { ok: true, bytes, mime }
  } catch (e) {
    return { ok: false, message: (e as Error).message ?? 'decode_failed' }
  }
}

/** 构造 data URI。 */
export function toDataUri(base64: string, mime: string): string {
  return `data:${mime || 'application/octet-stream'};base64,${base64}`
}

/** 魔数嗅探：常见二进制格式。识别不出返回 null。 */
export type SniffedType = { mime: string; ext: string }

const MAGIC: { bytes: number[]; offset?: number; mime: string; ext: string }[] = [
  { bytes: [0x89, 0x50, 0x4e, 0x47], mime: 'image/png', ext: 'png' },
  { bytes: [0xff, 0xd8, 0xff], mime: 'image/jpeg', ext: 'jpg' },
  { bytes: [0x47, 0x49, 0x46, 0x38], mime: 'image/gif', ext: 'gif' },
  { bytes: [0x52, 0x49, 0x46, 0x46], mime: 'image/webp', ext: 'webp' }, // RIFF（进一步校验 WEBP 见下）
  { bytes: [0x25, 0x50, 0x44, 0x46], mime: 'application/pdf', ext: 'pdf' },
  { bytes: [0x50, 0x4b, 0x03, 0x04], mime: 'application/zip', ext: 'zip' },
  { bytes: [0x1f, 0x8b], mime: 'application/gzip', ext: 'gz' },
  { bytes: [0x49, 0x44, 0x33], mime: 'audio/mpeg', ext: 'mp3' },
  { bytes: [0x4f, 0x67, 0x67, 0x53], mime: 'audio/ogg', ext: 'ogg' },
  { bytes: [0x00, 0x00, 0x00], offset: 4, mime: 'video/mp4', ext: 'mp4' }, // ftyp 粗略
]

export function sniffType(bytes: Uint8Array): SniffedType | null {
  // WEBP 需要 RIFF....WEBP 双段验证
  if (bytes.length >= 12 &&
    bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
    bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) {
    return { mime: 'image/webp', ext: 'webp' }
  }
  // MP4 ftyp box
  if (bytes.length >= 8 &&
    bytes[4] === 0x66 && bytes[5] === 0x74 && bytes[6] === 0x79 && bytes[7] === 0x70) {
    return { mime: 'video/mp4', ext: 'mp4' }
  }
  // SVG / XML / JSON 文本类
  const head = new TextDecoder().decode(bytes.subarray(0, 256)).trimStart()
  if (head.startsWith('<svg') || (head.startsWith('<?xml') && head.includes('<svg'))) {
    return { mime: 'image/svg+xml', ext: 'svg' }
  }
  if (head.startsWith('{') || head.startsWith('[')) {
    return { mime: 'application/json', ext: 'json' }
  }

  for (const m of MAGIC) {
    if (m.mime === 'image/webp' || m.mime === 'video/mp4') continue // 上面特判过
    const off = m.offset ?? 0
    if (bytes.length < off + m.bytes.length) continue
    let hit = true
    for (let i = 0; i < m.bytes.length; i++) {
      if (bytes[off + i] !== m.bytes[i]) { hit = false; break }
    }
    if (hit) return { mime: m.mime, ext: m.ext }
  }
  return null
}

/** 判定 bytes 是否大概率是文本（UTF-8 可解码 + 控制字符占比低）。 */
export function looksLikeText(bytes: Uint8Array): boolean {
  if (bytes.length === 0) return true
  const sample = bytes.subarray(0, 1024)
  try {
    const text = new TextDecoder('utf-8', { fatal: true }).decode(sample)
    let control = 0
    for (const ch of text) {
      const c = ch.codePointAt(0)!
      if (c < 32 && c !== 9 && c !== 10 && c !== 13) control += 1
    }
    return control / text.length < 0.05
  } catch {
    return false
  }
}

/** 人类可读文件大小。 */
export function formatSize(n: number): string {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / 1024 / 1024).toFixed(2)} MB`
}
