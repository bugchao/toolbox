/** Lorem 生成器：英文 lorem + 中文乱数假文，使用 mulberry32 实现可重现的伪随机。 */
import { LATIN_WORDS, CHINESE_CHARS } from './words'

export type Flavor = 'latin' | 'chinese'
export type Unit = 'paragraphs' | 'sentences' | 'words'

export type GenOptions = {
  flavor: Flavor
  unit: Unit
  count: number
  /** 是否以经典开头 "Lorem ipsum dolor sit amet…" 起步 */
  startWithClassic: boolean
  seed?: number
  /** 每段约多少句 */
  sentencesPerParagraph?: { min: number; max: number }
  /** 每句约多少词（字） */
  wordsPerSentence?: { min: number; max: number }
}

export const DEFAULT_OPTIONS: GenOptions = {
  flavor: 'latin',
  unit: 'paragraphs',
  count: 3,
  startWithClassic: true,
  seed: undefined,
  sentencesPerParagraph: { min: 3, max: 6 },
  wordsPerSentence: { min: 6, max: 14 },
}

const CLASSIC_LATIN = [
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
]
const CLASSIC_CHINESE = [
  '夫将欲观于天地之本，故能通其志而行于世，不失其道。',
]

/** mulberry32 PRNG。 */
export function makeRng(seed?: number): () => number {
  let s = (seed == null || !Number.isFinite(seed))
    ? Math.floor(Math.random() * 2 ** 31)
    : seed >>> 0
  return () => {
    s = (s + 0x6D2B79F5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function pick<T>(rng: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)]
}

function randInt(rng: () => number, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min
}

/** 生成一句拉丁文，单词数 [min, max]，首字母大写，末尾句号。 */
function makeLatinSentence(rng: () => number, opts: GenOptions): string {
  const w = opts.wordsPerSentence ?? DEFAULT_OPTIONS.wordsPerSentence!
  const n = randInt(rng, w.min, w.max)
  const words: string[] = []
  for (let i = 0; i < n; i++) words.push(pick(rng, LATIN_WORDS) as string)
  // 在中间偶尔插逗号
  for (let i = 2; i < words.length - 2; i++) {
    if (rng() < 0.08) words[i] = `${words[i]},`
  }
  let s = words.join(' ')
  s = s.charAt(0).toUpperCase() + s.slice(1)
  if (s.endsWith(',')) s = s.slice(0, -1)
  return s + '.'
}

/** 生成一句中文「假文」。 */
function makeChineseSentence(rng: () => number, opts: GenOptions): string {
  const w = opts.wordsPerSentence ?? DEFAULT_OPTIONS.wordsPerSentence!
  const n = randInt(rng, w.min + 2, w.max + 2)
  const chars: string[] = []
  for (let i = 0; i < n; i++) {
    chars.push(pick(rng, CHINESE_CHARS) as string)
    if (i > 0 && i < n - 1 && rng() < 0.08) chars.push('、')
  }
  let s = chars.join('')
  // 句末标点 80% 是句号，少量问号 / 叹号
  const r = rng()
  s += r < 0.85 ? '。' : r < 0.95 ? '？' : '！'
  return s
}

/** 生成一段。 */
function makeParagraph(rng: () => number, opts: GenOptions, index: number): string {
  const sp = opts.sentencesPerParagraph ?? DEFAULT_OPTIONS.sentencesPerParagraph!
  const sentences: string[] = []
  const useClassic = opts.startWithClassic && index === 0
  if (useClassic) {
    sentences.push(opts.flavor === 'latin' ? CLASSIC_LATIN[0] : CLASSIC_CHINESE[0])
  }
  const remaining = randInt(rng, sp.min, sp.max) - sentences.length
  for (let i = 0; i < Math.max(1, remaining); i++) {
    sentences.push(opts.flavor === 'latin' ? makeLatinSentence(rng, opts) : makeChineseSentence(rng, opts))
  }
  const joiner = opts.flavor === 'latin' ? ' ' : ''
  return sentences.join(joiner)
}

/** 入口：按选项生成纯文本数组（段落数组），稳定可重现。 */
export function generate(opts: Partial<GenOptions> = {}): string[] {
  const o: GenOptions = { ...DEFAULT_OPTIONS, ...opts }
  const rng = makeRng(o.seed)

  if (o.unit === 'paragraphs') {
    const out: string[] = []
    for (let i = 0; i < Math.max(1, o.count); i++) {
      out.push(makeParagraph(rng, o, i))
    }
    return out
  }

  if (o.unit === 'sentences') {
    const single: string[] = []
    if (o.startWithClassic) {
      single.push(o.flavor === 'latin' ? CLASSIC_LATIN[0] : CLASSIC_CHINESE[0])
    }
    for (let i = single.length; i < o.count; i++) {
      single.push(o.flavor === 'latin' ? makeLatinSentence(rng, o) : makeChineseSentence(rng, o))
    }
    return [o.flavor === 'latin' ? single.join(' ') : single.join('')]
  }

  // 'words' 模式
  const words: string[] = []
  for (let i = 0; i < o.count; i++) {
    words.push(o.flavor === 'latin' ? (pick(rng, LATIN_WORDS) as string) : (pick(rng, CHINESE_CHARS) as string))
  }
  return [o.flavor === 'latin' ? words.join(' ') : words.join('')]
}

export const __testing = { makeLatinSentence, makeChineseSentence, makeParagraph }
