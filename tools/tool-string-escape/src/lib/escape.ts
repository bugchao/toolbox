/** 多语境字符串转义 / 反转义。零依赖，纯函数。 */

export type EscapeLang = 'json' | 'js' | 'cstyle' | 'shell' | 'sql' | 'regex'

// ───────────── 转义 ─────────────

/** JSON 字符串转义（不含外层引号）。 */
export function escapeJson(s: string): string {
  let out = ''
  for (const ch of s) {
    const c = ch.codePointAt(0)!
    switch (ch) {
      case '"': out += '\\"'; break
      case '\\': out += '\\\\'; break
      case '\b': out += '\\b'; break
      case '\f': out += '\\f'; break
      case '\n': out += '\\n'; break
      case '\r': out += '\\r'; break
      case '\t': out += '\\t'; break
      default:
        if (c < 0x20) out += '\\u' + c.toString(16).padStart(4, '0')
        else out += ch
    }
  }
  return out
}

/** JS 字符串转义（含 \v \0 与单引号）。 */
export function escapeJs(s: string): string {
  let out = ''
  for (const ch of s) {
    const c = ch.codePointAt(0)!
    switch (ch) {
      case '"': out += '\\"'; break
      case "'": out += "\\'"; break
      case '`': out += '\\`'; break
      case '\\': out += '\\\\'; break
      case '\b': out += '\\b'; break
      case '\f': out += '\\f'; break
      case '\n': out += '\\n'; break
      case '\r': out += '\\r'; break
      case '\t': out += '\\t'; break
      case '\v': out += '\\v'; break
      case '\0': out += '\\0'; break
      default:
        if (c < 0x20) out += '\\x' + c.toString(16).padStart(2, '0')
        else out += ch
    }
  }
  return out
}

/** C / Java 风格转义。 */
export function escapeC(s: string): string {
  let out = ''
  for (const ch of s) {
    const c = ch.codePointAt(0)!
    switch (ch) {
      case '"': out += '\\"'; break
      case '\\': out += '\\\\'; break
      case '\b': out += '\\b'; break
      case '\f': out += '\\f'; break
      case '\n': out += '\\n'; break
      case '\r': out += '\\r'; break
      case '\t': out += '\\t'; break
      case '\v': out += '\\v'; break
      case '\0': out += '\\0'; break
      default:
        if (c < 0x20) out += '\\' + c.toString(8).padStart(3, '0')
        else out += ch
    }
  }
  return out
}

/** Shell 单引号包裹：把内部 ' 换成 '\'' 。返回含外层引号的安全串。 */
export function escapeShell(s: string): string {
  return "'" + s.replace(/'/g, "'\\''") + "'"
}

/** SQL 单引号字符串：' → ''（标准 SQL）。返回含外层引号。 */
export function escapeSql(s: string): string {
  return "'" + s.replace(/'/g, "''") + "'"
}

/** 正则字面量转义（把字符串变成匹配自身的 pattern）。 */
export function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function escape(lang: EscapeLang, s: string): string {
  switch (lang) {
    case 'json': return escapeJson(s)
    case 'js': return escapeJs(s)
    case 'cstyle': return escapeC(s)
    case 'shell': return escapeShell(s)
    case 'sql': return escapeSql(s)
    case 'regex': return escapeRegex(s)
  }
}

// ───────────── 反转义 ─────────────

/** 通用反斜杠序列反转义（覆盖 json/js/c 常见序列 + \xHH \uHHHH \u{...} \ooo）。 */
function unescapeBackslash(s: string): string {
  let out = ''
  let i = 0
  while (i < s.length) {
    const ch = s[i]
    if (ch !== '\\') { out += ch; i += 1; continue }
    const next = s[i + 1]
    if (next === undefined) { out += '\\'; i += 1; continue }
    // 八进制 \ooo（1-3 位），覆盖 \0：先于具名分支处理
    if (next >= '0' && next <= '7') {
      let oct = next
      let j = i + 2
      while (j < s.length && oct.length < 3 && s[j] >= '0' && s[j] <= '7') { oct += s[j]; j += 1 }
      out += String.fromCharCode(parseInt(oct, 8))
      i = j
      continue
    }
    switch (next) {
      case 'n': out += '\n'; i += 2; break
      case 'r': out += '\r'; i += 2; break
      case 't': out += '\t'; i += 2; break
      case 'b': out += '\b'; i += 2; break
      case 'f': out += '\f'; i += 2; break
      case 'v': out += '\v'; i += 2; break
      case '"': out += '"'; i += 2; break
      case "'": out += "'"; i += 2; break
      case '`': out += '`'; i += 2; break
      case '\\': out += '\\'; i += 2; break
      case 'x': {
        const hex = s.slice(i + 2, i + 4)
        if (/^[0-9a-fA-F]{2}$/.test(hex)) { out += String.fromCharCode(parseInt(hex, 16)); i += 4 }
        else { out += next; i += 2 }
        break
      }
      case 'u': {
        if (s[i + 2] === '{') {
          const end = s.indexOf('}', i + 3)
          const hex = end !== -1 ? s.slice(i + 3, end) : ''
          if (end !== -1 && /^[0-9a-fA-F]+$/.test(hex)) { out += String.fromCodePoint(parseInt(hex, 16)); i = end + 1 }
          else { out += next; i += 2 }
        } else {
          const hex = s.slice(i + 2, i + 6)
          if (/^[0-9a-fA-F]{4}$/.test(hex)) { out += String.fromCharCode(parseInt(hex, 16)); i += 6 }
          else { out += next; i += 2 }
        }
        break
      }
      default: out += next; i += 2
    }
  }
  return out
}

/** Shell / SQL 反转义：剥外层单引号并还原内部转义。无外层引号则原样还原。 */
function unescapeShell(s: string): string {
  let v = s.trim()
  if (v.startsWith("'") && v.endsWith("'") && v.length >= 2) v = v.slice(1, -1)
  return v.replace(/'\\''/g, "'")
}
function unescapeSql(s: string): string {
  let v = s.trim()
  if (v.startsWith("'") && v.endsWith("'") && v.length >= 2) v = v.slice(1, -1)
  return v.replace(/''/g, "'")
}

export function unescape(lang: EscapeLang, s: string): string {
  switch (lang) {
    case 'shell': return unescapeShell(s)
    case 'sql': return unescapeSql(s)
    case 'regex': return s.replace(/\\([.*+?^${}()|[\]\\])/g, '$1')
    default: return unescapeBackslash(s)
  }
}
