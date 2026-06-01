/** 文件拆块器 —— 把文件文本切成可翻译片段，并能重组回完整文件。 */

export type Chunk = {
  index: number
  /** 原文 */
  text: string
}

export type ParagraphSplit = {
  /** 含实际内容的段落（空白/纯分隔的段不入 chunks） */
  chunks: Chunk[]
  /** chunks[i] 后面要拼接的分隔串；长度 = chunks.length */
  separators: string[]
  /** 文件开头第一段前的「领头分隔串」（通常是 '' 或仅含空行） */
  leading: string
}

const SEP_RE = /(\n[ \t]*\n+)/

/**
 * 按空行段落拆分；空白段会被折叠进相邻 separator / leading 中，**保证 chunks 只含可翻译内容**。
 * 重组：`leading + chunks[0] + sep[0] + chunks[1] + sep[1] + ... + chunks[n-1] + sep[n-1]` === 原文本。
 */
export function splitParagraphs(text: string): ParagraphSplit {
  if (!text) return { chunks: [], separators: [], leading: '' }

  const parts = text.split(SEP_RE)
  // parts: [para0, sep0, para1, sep1, ..., paraN] —— 偶数下标是段内容，奇数下标是空行分隔串
  let leading = ''
  const chunks: Chunk[] = []
  const separators: string[] = []

  for (let i = 0; i < parts.length; i += 2) {
    const content = parts[i] ?? ''
    const sep = parts[i + 1] ?? ''
    if (content.trim() === '') {
      // 折叠：空白段并入前一段的 separator，没有前段则进 leading
      if (separators.length > 0) {
        separators[separators.length - 1] += content + sep
      } else {
        leading += content + sep
      }
    } else {
      chunks.push({ index: chunks.length, text: content })
      separators.push(sep)
    }
  }
  return { chunks, separators, leading }
}

/** 把翻译结果按原始拆分位置重新拼回。translated 长度需与 split.chunks 一致；缺失项用原文兜底。 */
export function joinParagraphs(split: ParagraphSplit, translated: string[]): string {
  let out = split.leading
  for (let i = 0; i < split.chunks.length; i++) {
    out += translated[i] ?? split.chunks[i].text
    out += split.separators[i] ?? ''
  }
  return out
}

/** 文件类型探测：基于扩展名，未识别返回 'txt'。 */
export type FileKind = 'txt' | 'md'

export function detectKind(filename: string): FileKind {
  const lower = filename.toLowerCase()
  if (lower.endsWith('.md') || lower.endsWith('.markdown') || lower.endsWith('.mdx')) return 'md'
  return 'txt'
}

/** 是否需要翻译：纯空白 / 纯标点 / 纯数字段不翻译，原样保留以节省 token。 */
export function shouldTranslate(text: string): boolean {
  const t = text.trim()
  if (!t) return false
  if (/^[\d\s\p{P}\p{S}]+$/u.test(t)) return false
  return true
}
