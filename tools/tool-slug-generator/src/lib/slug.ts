/** Slug 生成核心：纯函数，完整可测。 */
import { pinyin } from 'pinyin-pro'

export type ChineseStrategy = 'pinyin-full' | 'pinyin-initials' | 'skip' | 'keep'
export type CaseStrategy = 'lower' | 'upper' | 'preserve'

export type SlugOptions = {
  separator: string
  case: CaseStrategy
  maxLength?: number
  stripStopwords: boolean
  chineseStrategy: ChineseStrategy
  /** 在常规字符过滤之外额外保留的字符（如允许 `.` `~`） */
  allowedExtras: string
  /** 自定义替换，键=原文片段，值=替换文本（在拼音 / 过滤前应用） */
  customReplacements: Record<string, string>
  /** 是否剥离 Unicode 变音符号（é → e） */
  stripDiacritics: boolean
}

export const DEFAULT_OPTIONS: SlugOptions = {
  separator: '-',
  case: 'lower',
  stripStopwords: false,
  chineseStrategy: 'pinyin-full',
  allowedExtras: '',
  customReplacements: {},
  stripDiacritics: true,
}

const EN_STOPWORDS = new Set<string>([
  'a', 'an', 'the',
  'and', 'or', 'but', 'nor',
  'of', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'from', 'as',
  'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'this', 'that', 'these', 'those',
])

const CJK_RE = /[㐀-鿿豈-﫿]/

function applyReplacements(s: string, map: Record<string, string>): string {
  let out = s
  for (const [k, v] of Object.entries(map)) {
    if (!k) continue
    // 简单字符串替换（区分大小写），可重复匹配
    out = out.split(k).join(v)
  }
  return out
}

function stripDiacritics(s: string): string {
  // NFD 拆开 + 删去组合标记
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '')
}

/** 把单段中文转拼音 / 首字母 / 跳过 / 保留。 */
function convertChineseSegment(s: string, strategy: ChineseStrategy): string {
  if (strategy === 'keep') return s
  if (strategy === 'skip') return s.replace(/[㐀-鿿豈-﫿]/g, '')
  // pinyin 模式 —— 一次性调 pinyin-pro 处理整段
  if (strategy === 'pinyin-full') {
    return pinyin(s, { toneType: 'none', type: 'array' }).join(' ')
  }
  // pinyin-initials —— 首字母连写
  return pinyin(s, { pattern: 'first', toneType: 'none', type: 'array' }).join(' ')
}

/**
 * 文本是按 CJK / 非 CJK 切段处理 —— 否则把英文也送进 pinyin-pro 会破坏原文。
 * 切完段：CJK 段走 chineseStrategy，非 CJK 段保留原文。
 */
function transformByLanguage(s: string, strategy: ChineseStrategy): string {
  if (!CJK_RE.test(s)) return s
  const out: string[] = []
  let cur = ''
  let curCjk = CJK_RE.test(s[0])
  for (const ch of s) {
    const isCjk = CJK_RE.test(ch)
    if (isCjk === curCjk) {
      cur += ch
    } else {
      out.push(curCjk ? convertChineseSegment(cur, strategy) : cur)
      cur = ch
      curCjk = isCjk
    }
  }
  if (cur) out.push(curCjk ? convertChineseSegment(cur, strategy) : cur)
  return out.join(' ')
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** 主入口：text → slug。 */
export function slugify(text: string, options: Partial<SlugOptions> = {}): string {
  const opt: SlugOptions = { ...DEFAULT_OPTIONS, ...options }
  if (!text) return ''

  let s = text

  // 1. 自定义替换（先于其它转换；最高优先级）
  s = applyReplacements(s, opt.customReplacements)

  // 2. CJK 转换（拼音 / 首字母 / 跳过 / 保留）
  s = transformByLanguage(s, opt.chineseStrategy)

  // 3. 剥离变音符
  if (opt.stripDiacritics) s = stripDiacritics(s)

  // 4. case
  if (opt.case === 'lower') s = s.toLowerCase()
  else if (opt.case === 'upper') s = s.toUpperCase()

  // 5. 切词（按非字母数字字符切）
  // 构造允许字符集：基础 [a-zA-Z0-9] + 可选 CJK（keep 模式）+ allowedExtras
  const extras = escapeRegex(opt.allowedExtras)
  const cjkPart = opt.chineseStrategy === 'keep' ? '㐀-鿿豈-﫿' : ''
  const wordRe = new RegExp(`[^a-zA-Z0-9${cjkPart}${extras}]+`, 'g')
  let words = s.split(wordRe).filter(Boolean)

  // 6. 停用词
  if (opt.stripStopwords) {
    words = words.filter((w) => !EN_STOPWORDS.has(w.toLowerCase()))
  }

  if (words.length === 0) return ''

  // 7. 拼接
  let slug = words.join(opt.separator)

  // 8. 最大长度（在 separator 处优雅截断）
  if (opt.maxLength && opt.maxLength > 0 && slug.length > opt.maxLength) {
    // 若 maxLength 正好落在分隔符上，前缀已是干净词边界
    if (opt.separator && slug[opt.maxLength] === opt.separator) {
      slug = slug.slice(0, opt.maxLength)
    } else {
      const cut = slug.slice(0, opt.maxLength)
      const lastSep = opt.separator ? cut.lastIndexOf(opt.separator) : -1
      slug = lastSep > opt.maxLength * 0.5 ? cut.slice(0, lastSep) : cut
    }
  }

  // 9. 去首尾 separator
  if (opt.separator) {
    const sepRe = new RegExp(`^${escapeRegex(opt.separator)}+|${escapeRegex(opt.separator)}+$`, 'g')
    slug = slug.replace(sepRe, '')
  }

  return slug
}

/** 批量：逐行处理，空行原样保留。 */
export function slugifyBatch(text: string, options: Partial<SlugOptions> = {}): string {
  return text.split('\n').map((line) => slugify(line, options)).join('\n')
}

export const __testing = {
  applyReplacements,
  stripDiacritics,
  transformByLanguage,
  EN_STOPWORDS,
}
