// XML 解析 / 格式化 / 压缩工具
// 全部基于浏览器原生 DOMParser，无第三方依赖

export interface ParseError {
  message: string
  line?: number
  column?: number
}

export interface ParseResult {
  doc: Document | null
  error: ParseError | null
  /** 检测到的 XML 声明字符串，如 <?xml version="1.0" encoding="UTF-8"?>，如果原文有就保留 */
  declaration: string | null
}

/**
 * 解析 XML。注意：DOMParser('text/xml') 错误不会抛异常，而是返回一个文档，
 * 其中 documentElement 是 <parsererror>。
 */
export function parseXml(input: string): ParseResult {
  const trimmed = input.trim()
  if (!trimmed) {
    return { doc: null, error: { message: 'empty' }, declaration: null }
  }
  // 提取 XML 声明（如果存在）
  let declaration: string | null = null
  const declMatch = trimmed.match(/^<\?xml\b[^?]*\?>/)
  if (declMatch) declaration = declMatch[0]

  const parser = new DOMParser()
  const doc = parser.parseFromString(input, 'text/xml')
  // Chrome / Firefox 在 parsererror 命名空间下返回错误
  const errEl = doc.getElementsByTagName('parsererror')[0]
  if (errEl) {
    // 解析 Chrome 风格错误："XML Parsing Error: ... \nLocation: ...\nLine Number 3, Column 5:..."
    const text = errEl.textContent ?? ''
    const lineMatch = text.match(/(?:Line\s*(?:Number)?|line)\D*(\d+)/i)
    const colMatch = text.match(/(?:Column|column)\D*(\d+)/i)
    const cleaned = text
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 4)
      .join(' · ')
    return {
      doc: null,
      declaration,
      error: {
        message: cleaned || 'XML parse error',
        line: lineMatch ? Number(lineMatch[1]) : undefined,
        column: colMatch ? Number(colMatch[1]) : undefined,
      },
    }
  }
  return { doc, error: null, declaration }
}

// ── XML escape ──────────────────────────────────────────
function escAttr(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
function escText(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

// ── 自定义递归序列化 ────────────────────────────────────

export interface FormatOptions {
  indent: string // 缩进单位（"  " / "    " / "\t"）
  /** 是否保留注释 */
  keepComments: boolean
  /** 是否对仅含一个文本子节点的元素 inline 输出 */
  inlineSimple: boolean
}

const DEFAULT_FORMAT: FormatOptions = {
  indent: '  ',
  keepComments: true,
  inlineSimple: true,
}

function serializeAttrs(el: Element): string {
  const list: string[] = []
  for (let i = 0; i < el.attributes.length; i++) {
    const a = el.attributes[i]
    list.push(`${a.name}="${escAttr(a.value)}"`)
  }
  return list.length > 0 ? ' ' + list.join(' ') : ''
}

function isOnlySimpleText(el: Element): boolean {
  if (el.childNodes.length !== 1) return false
  const c = el.childNodes[0]
  if (c.nodeType !== Node.TEXT_NODE) return false
  const t = c.nodeValue ?? ''
  return !/[\r\n]/.test(t)
}

function serializeNode(
  node: Node,
  depth: number,
  opts: FormatOptions,
  out: string[],
): void {
  const pad = opts.indent.repeat(depth)

  switch (node.nodeType) {
    case Node.ELEMENT_NODE: {
      const el = node as Element
      const tag = el.tagName
      const attrs = serializeAttrs(el)

      // 收集有效子节点（移除空白 text node）
      const children: Node[] = []
      for (let i = 0; i < el.childNodes.length; i++) {
        const c = el.childNodes[i]
        if (c.nodeType === Node.TEXT_NODE) {
          const t = c.nodeValue ?? ''
          if (t.trim().length > 0) children.push(c)
          // 空白 text node 在格式化模式下移除
        } else if (c.nodeType === Node.COMMENT_NODE) {
          if (opts.keepComments) children.push(c)
        } else {
          children.push(c)
        }
      }

      if (children.length === 0) {
        out.push(`${pad}<${tag}${attrs}/>`)
        return
      }

      // 简单文本元素 inline 输出
      if (opts.inlineSimple && children.length === 1 && children[0].nodeType === Node.TEXT_NODE) {
        const t = (children[0].nodeValue ?? '').trim()
        out.push(`${pad}<${tag}${attrs}>${escText(t)}</${tag}>`)
        return
      }

      out.push(`${pad}<${tag}${attrs}>`)
      for (const c of children) {
        serializeNode(c, depth + 1, opts, out)
      }
      out.push(`${pad}</${tag}>`)
      return
    }
    case Node.TEXT_NODE: {
      const t = (node.nodeValue ?? '').trim()
      if (t) out.push(`${pad}${escText(t)}`)
      return
    }
    case Node.COMMENT_NODE: {
      const t = (node.nodeValue ?? '').trim()
      out.push(`${pad}<!--${t.includes('\n') ? '\n' + pad + t + '\n' + pad : ' ' + t + ' '}-->`)
      return
    }
    case Node.CDATA_SECTION_NODE: {
      const t = node.nodeValue ?? ''
      out.push(`${pad}<![CDATA[${t}]]>`)
      return
    }
    case Node.PROCESSING_INSTRUCTION_NODE: {
      const pi = node as ProcessingInstruction
      out.push(`${pad}<?${pi.target} ${pi.data}?>`)
      return
    }
    default:
      return
  }
}

export function formatXml(input: string, opts: Partial<FormatOptions> = {}): { text: string; error: ParseError | null; nodeCount: number } {
  const merged: FormatOptions = { ...DEFAULT_FORMAT, ...opts }
  const parsed = parseXml(input)
  if (parsed.error || !parsed.doc) {
    return { text: '', error: parsed.error ?? { message: 'unknown' }, nodeCount: 0 }
  }
  const out: string[] = []
  if (parsed.declaration) out.push(parsed.declaration)
  serializeNode(parsed.doc.documentElement, 0, merged, out)
  return { text: out.join('\n'), error: null, nodeCount: countElements(parsed.doc) }
}

function countElements(node: Node): number {
  let count = 0
  function walk(n: Node) {
    if (n.nodeType === Node.ELEMENT_NODE) count++
    for (let i = 0; i < n.childNodes.length; i++) walk(n.childNodes[i])
  }
  walk(node)
  return count
}

/** 压缩：移除所有 element 间的空白 text node + 注释（可选） */
export function minifyXml(input: string, dropComments = false): { text: string; error: ParseError | null } {
  const parsed = parseXml(input)
  if (parsed.error || !parsed.doc) {
    return { text: '', error: parsed.error ?? { message: 'unknown' } }
  }

  // 递归去除 whitespace-only text node
  function clean(node: Node): void {
    const toRemove: Node[] = []
    for (let i = 0; i < node.childNodes.length; i++) {
      const c = node.childNodes[i]
      if (c.nodeType === Node.TEXT_NODE) {
        if (!(c.nodeValue ?? '').trim()) toRemove.push(c)
      } else if (c.nodeType === Node.COMMENT_NODE && dropComments) {
        toRemove.push(c)
      } else {
        clean(c)
      }
    }
    for (const r of toRemove) node.removeChild(r)
  }
  clean(parsed.doc)

  const serializer = new XMLSerializer()
  let text = serializer.serializeToString(parsed.doc)
  // 移除 element 之间残留的换行符（保守一点）
  text = text.replace(/>\s+</g, '><')
  // 若原文有声明但 XMLSerializer 没保留，补上
  if (parsed.declaration && !text.startsWith('<?xml')) {
    text = parsed.declaration + text
  }
  return { text, error: null }
}
