/**
 * HTML 实体双向编解码核心库（无第三方依赖）
 *
 * 设计要点：
 * - 使用 `for ... of` 遍历字符串可以按 code point 处理代理对（emoji 等）
 * - 编码强度（mode）影响输出，但 minimal 集合（< > & " '）总会被处理
 * - 解码使用宽松正则，命名实体匹配最长前缀（允许分号缺失）
 */

/** 编码强度 */
export type EncodeMode =
  | 'minimal'
  | 'named-extended'
  | 'non-ascii-decimal'
  | 'non-ascii-hex'
  | 'all-non-ascii-named'

/** minimal 必编集合：HTML 解析必须转义的字符。 */
const MINIMAL_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;',
}

/**
 * 常用命名实体表（char → entityName，不含 & 和分号）。
 * 25-30 个常用记号，覆盖排版、版权、数学、货币等常见符号。
 * 注意：nbsp 映射到 U+00A0（不间断空格），而非普通 U+0020 空格。
 */
export const NAMED_BY_CHAR: Readonly<Record<string, string>> = {
  '&': 'amp',
  '<': 'lt',
  '>': 'gt',
  '"': 'quot',
  "'": 'apos',
  ' ': 'nbsp',
  '©': 'copy',
  '®': 'reg',
  '™': 'trade',
  '…': 'hellip',
  '—': 'mdash',
  '–': 'ndash',
  '‘': 'lsquo',
  '’': 'rsquo',
  '“': 'ldquo',
  '”': 'rdquo',
  '«': 'laquo',
  '»': 'raquo',
  '°': 'deg',
  '±': 'plusmn',
  '×': 'times',
  '÷': 'divide',
  '¢': 'cent',
  '£': 'pound',
  '¥': 'yen',
  '€': 'euro',
  '§': 'sect',
  '¶': 'para',
  '¼': 'frac14',
  '½': 'frac12',
  '¾': 'frac34',
}

/** 反向映射：entityName → char（用于解码）。 */
export const CHAR_BY_NAMED: Readonly<Record<string, string>> = Object.freeze(
  Object.fromEntries(
    Object.entries(NAMED_BY_CHAR).map(([ch, name]) => [name, ch])
  ),
)

/** 用于解码时按最长前缀贪婪匹配：命名实体名按长度倒序排列。 */
const NAMED_NAMES_SORTED: readonly string[] = Object.keys(CHAR_BY_NAMED).sort(
  (a, b) => b.length - a.length,
)

/** 判断是否为 ASCII（U+0000..U+007F）。 */
function isAscii(codePoint: number): boolean {
  return codePoint >= 0 && codePoint <= 0x7f
}

/** 把一个 code point 输出为 `&#dddd;`。 */
function toDecimalEntity(codePoint: number): string {
  return `&#${codePoint};`
}

/** 把一个 code point 输出为 `&#xHHHH;`（小写 hex）。 */
function toHexEntity(codePoint: number): string {
  return `&#x${codePoint.toString(16)};`
}

/**
 * 按选择的强度对字符串做实体编码。
 *
 * - minimal: 仅编码 `< > & " '`
 * - named-extended: minimal + 命名表中其它字符
 * - non-ascii-decimal: minimal + 非 ASCII → `&#dddd;`
 * - non-ascii-hex: minimal + 非 ASCII → `&#xHHHH;`
 * - all-non-ascii-named: minimal + 命名表优先；命名表没有的非 ASCII 回退到 hex
 */
export function encodeHtml(input: string, mode: EncodeMode = 'minimal'): string {
  if (!input) return ''
  let out = ''
  for (const ch of input) {
    // ch 在代理对场景下是完整字符（长度可能是 2 个 UTF-16 单元）
    const cp = ch.codePointAt(0)
    if (cp === undefined) continue

    // minimal 集合永远先处理
    if (MINIMAL_MAP[ch]) {
      out += MINIMAL_MAP[ch]
      continue
    }

    if (mode === 'minimal') {
      out += ch
      continue
    }

    if (mode === 'named-extended') {
      const named = NAMED_BY_CHAR[ch]
      out += named ? `&${named};` : ch
      continue
    }

    if (mode === 'all-non-ascii-named') {
      const named = NAMED_BY_CHAR[ch]
      if (named) {
        out += `&${named};`
      } else if (!isAscii(cp)) {
        out += toHexEntity(cp)
      } else {
        out += ch
      }
      continue
    }

    if (mode === 'non-ascii-decimal') {
      out += !isAscii(cp) ? toDecimalEntity(cp) : ch
      continue
    }

    if (mode === 'non-ascii-hex') {
      out += !isAscii(cp) ? toHexEntity(cp) : ch
      continue
    }
  }
  return out
}

/** 把 code point 安全转为字符串（处理超出 BMP 的代理对）。 */
function safeFromCodePoint(cp: number): string | null {
  if (!Number.isFinite(cp)) return null
  if (cp < 0 || cp > 0x10ffff) return null
  // surrogate halves 是非法字符
  if (cp >= 0xd800 && cp <= 0xdfff) return null
  try {
    return String.fromCodePoint(cp)
  } catch {
    return null
  }
}

/**
 * 宽松解码：识别 `&name;`、`&#nnnn;`、`&#xHHHH;`；分号可省略。
 *
 * 实现策略：手动扫描，遇到 `&` 后用最长前缀匹配命名表 / 数字实体，
 * 可以正确处理 `&ampfoo` → `&foo` 这类"缺分号 + 后接字母"的场景。
 * 未识别的实体保留原样（包括 `&unknown;`）。
 */
export function decodeHtml(input: string): string {
  if (!input) return ''
  let out = ''
  let i = 0
  const n = input.length

  while (i < n) {
    const ch = input[i]
    if (ch !== '&') {
      out += ch
      i += 1
      continue
    }

    // 1) 数字实体：&#... 或 &#x...
    if (input[i + 1] === '#') {
      const isHex = input[i + 2] === 'x' || input[i + 2] === 'X'
      const start = isHex ? i + 3 : i + 2
      const digitRe = isHex ? /[0-9a-fA-F]/ : /[0-9]/
      let j = start
      while (j < n && digitRe.test(input[j])) j += 1
      if (j > start) {
        const digits = input.slice(start, j)
        const cp = parseInt(digits, isHex ? 16 : 10)
        const decoded = safeFromCodePoint(cp)
        if (decoded != null) {
          out += decoded
          if (input[j] === ';') j += 1
          i = j
          continue
        }
      }
      // 不是合法数字实体：保留 '&' 原样
      out += '&'
      i += 1
      continue
    }

    // 2) 命名实体：&name 或 &name;（最长前缀匹配）
    let matched: string | null = null
    for (const name of NAMED_NAMES_SORTED) {
      if (input.startsWith(name, i + 1)) {
        matched = name
        break
      }
    }

    if (matched) {
      out += CHAR_BY_NAMED[matched]
      const afterName = i + 1 + matched.length
      const next = afterName < n ? input[afterName] : ''
      i = next === ';' ? afterName + 1 : afterName
      continue
    }

    // 3) 既不是数字实体也不是命名实体：保留 '&' 原样
    out += '&'
    i += 1
  }

  return out
}
