/** Unicode 字符检查：码点遍历 + 编码 + 转义 + Unicode 块归类。零依赖纯函数。 */

export type CharInfo = {
  /** 字形（可能是多 UTF-16 码元的代理对，但单码点） */
  char: string
  /** 码点 */
  codePoint: number
  /** U+XXXX 形式 */
  hex: string
  /** Unicode 块名（粗粒度） */
  block: string
  /** UTF-8 字节（十六进制，空格分隔） */
  utf8: string
  /** UTF-16 码元（十六进制，空格分隔） */
  utf16: string
  /** 是否代理对（需要 2 个 UTF-16 码元） */
  isAstral: boolean
  /** JS 转义 \uXXXX 或 \u{XXXXX} */
  jsEscape: string
  /** HTML 实体 &#xXXXX; */
  htmlEntity: string
  /** CSS 转义 \XXXX */
  cssEscape: string
}

/** 粗粒度 Unicode 块表（覆盖常见区段，命中第一个区间）。 */
const BLOCKS: { from: number; to: number; name: string }[] = [
  { from: 0x0000, to: 0x001f, name: 'C0 Control' },
  { from: 0x0020, to: 0x007f, name: 'Basic Latin' },
  { from: 0x0080, to: 0x00ff, name: 'Latin-1 Supplement' },
  { from: 0x0100, to: 0x017f, name: 'Latin Extended-A' },
  { from: 0x0180, to: 0x024f, name: 'Latin Extended-B' },
  { from: 0x0370, to: 0x03ff, name: 'Greek and Coptic' },
  { from: 0x0400, to: 0x04ff, name: 'Cyrillic' },
  { from: 0x0590, to: 0x05ff, name: 'Hebrew' },
  { from: 0x0600, to: 0x06ff, name: 'Arabic' },
  { from: 0x2000, to: 0x206f, name: 'General Punctuation' },
  { from: 0x20a0, to: 0x20cf, name: 'Currency Symbols' },
  { from: 0x2190, to: 0x21ff, name: 'Arrows' },
  { from: 0x2200, to: 0x22ff, name: 'Mathematical Operators' },
  { from: 0x2600, to: 0x26ff, name: 'Miscellaneous Symbols' },
  { from: 0x2700, to: 0x27bf, name: 'Dingbats' },
  { from: 0x3040, to: 0x309f, name: 'Hiragana' },
  { from: 0x30a0, to: 0x30ff, name: 'Katakana' },
  { from: 0x3400, to: 0x4dbf, name: 'CJK Extension A' },
  { from: 0x4e00, to: 0x9fff, name: 'CJK Unified Ideographs' },
  { from: 0xac00, to: 0xd7af, name: 'Hangul Syllables' },
  { from: 0xe000, to: 0xf8ff, name: 'Private Use Area' },
  { from: 0xf900, to: 0xfaff, name: 'CJK Compatibility Ideographs' },
  { from: 0xfe00, to: 0xfe0f, name: 'Variation Selectors' },
  { from: 0xff00, to: 0xffef, name: 'Halfwidth and Fullwidth Forms' },
  { from: 0x1f300, to: 0x1f5ff, name: 'Miscellaneous Symbols and Pictographs' },
  { from: 0x1f600, to: 0x1f64f, name: 'Emoticons' },
  { from: 0x1f680, to: 0x1f6ff, name: 'Transport and Map Symbols' },
  { from: 0x1f900, to: 0x1f9ff, name: 'Supplemental Symbols and Pictographs' },
  { from: 0x20000, to: 0x2a6df, name: 'CJK Extension B' },
]

export function blockOf(cp: number): string {
  for (const b of BLOCKS) {
    if (cp >= b.from && cp <= b.to) return b.name
  }
  return 'Unknown'
}

export function toHex(cp: number): string {
  return 'U+' + cp.toString(16).toUpperCase().padStart(4, '0')
}

/** 单码点 → UTF-8 字节数组。 */
export function utf8Bytes(cp: number): number[] {
  if (cp <= 0x7f) return [cp]
  if (cp <= 0x7ff) return [0xc0 | (cp >> 6), 0x80 | (cp & 0x3f)]
  if (cp <= 0xffff) return [0xe0 | (cp >> 12), 0x80 | ((cp >> 6) & 0x3f), 0x80 | (cp & 0x3f)]
  return [
    0xf0 | (cp >> 18),
    0x80 | ((cp >> 12) & 0x3f),
    0x80 | ((cp >> 6) & 0x3f),
    0x80 | (cp & 0x3f),
  ]
}

/** 单码点 → UTF-16 码元数组（astral 为代理对）。 */
export function utf16Units(cp: number): number[] {
  if (cp <= 0xffff) return [cp]
  const v = cp - 0x10000
  return [0xd800 + (v >> 10), 0xdc00 + (v & 0x3ff)]
}

function hexBytes(bytes: number[], pad: number): string {
  return bytes.map((b) => b.toString(16).toUpperCase().padStart(pad, '0')).join(' ')
}

export function jsEscape(cp: number): string {
  if (cp <= 0xffff) return '\\u' + cp.toString(16).toUpperCase().padStart(4, '0')
  return '\\u{' + cp.toString(16).toUpperCase() + '}'
}

export function inspectChar(char: string): CharInfo {
  const cp = char.codePointAt(0)!
  return {
    char,
    codePoint: cp,
    hex: toHex(cp),
    block: blockOf(cp),
    utf8: hexBytes(utf8Bytes(cp), 2),
    utf16: hexBytes(utf16Units(cp), 4),
    isAstral: cp > 0xffff,
    jsEscape: jsEscape(cp),
    htmlEntity: '&#x' + cp.toString(16).toUpperCase() + ';',
    cssEscape: '\\' + cp.toString(16).toUpperCase(),
  }
}

/** 按码点（非 UTF-16 码元）遍历字符串 —— emoji / 代理对算一个。 */
export function inspect(text: string): CharInfo[] {
  return [...text].map(inspectChar)
}

export type TextStats = {
  /** 字形数（码点数，代理对算 1） */
  codePoints: number
  /** UTF-16 长度（String.length，代理对算 2） */
  utf16Length: number
  /** UTF-8 字节数 */
  utf8Bytes: number
  /** 是否含 astral（>U+FFFF）码点 */
  hasAstral: boolean
}

export function textStats(text: string): TextStats {
  let codePoints = 0
  let utf8 = 0
  let hasAstral = false
  for (const ch of text) {
    const cp = ch.codePointAt(0)!
    codePoints += 1
    utf8 += utf8Bytes(cp).length
    if (cp > 0xffff) hasAstral = true
  }
  return { codePoints, utf16Length: text.length, utf8Bytes: utf8, hasAstral }
}
