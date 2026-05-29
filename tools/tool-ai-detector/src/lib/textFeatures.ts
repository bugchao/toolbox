// 文本启发式特征计算
// 设计原则：每个特征独立可解释，输出特征值与"AI 倾向贡献分"。

export type Feature = {
  key: string
  rawLabel: string
  value: number | string
  /** 对 AI 倾向的贡献，0..100，50 表示中性 */
  contribution: number
  weight: number
}

export type SuspiciousSentence = {
  text: string
  score: number
  reasons: string[]
}

export type TextAnalysis = {
  language: 'zh' | 'en' | 'mixed'
  length: number
  features: Feature[]
  suspiciousSentences: SuspiciousSentence[]
}

const ZH_CHAR_RE = /[一-鿿]/g
const EN_WORD_RE = /[A-Za-z][A-Za-z']*/g
const SENTENCE_SPLIT_RE = /[。！？.!?\n]+/g

/** 检测语言：中文字符占比 ≥ 50% 视为中文 */
export function detectLanguage(text: string): 'zh' | 'en' | 'mixed' {
  const zh = (text.match(ZH_CHAR_RE) ?? []).length
  const en = (text.match(EN_WORD_RE) ?? []).length
  if (zh === 0 && en === 0) return 'mixed'
  if (zh >= en * 2) return 'zh'
  if (en >= zh * 2) return 'en'
  return 'mixed'
}

const EN_AI_LEXICON = [
  // GPT 偏好词（社区常列）
  'moreover',
  'furthermore',
  'navigate',
  'leverage',
  'delve',
  'robust',
  'comprehensive',
  'underscore',
  'pivotal',
  'realm',
  'tapestry',
  'multifaceted',
  'meticulous',
  'paramount',
  'tailored',
  'intricate',
]

const ZH_AI_LEXICON = [
  '综上所述',
  '总而言之',
  '值得注意的是',
  '不容忽视',
  '与此同时',
  '此外',
  '然而',
  '总的来说',
  '在某种程度上',
  '尤为关键',
  '至关重要',
  '深入探讨',
  '全面',
  '凸显',
  '助力',
  '赋能',
]

function shannonEntropy(text: string): number {
  if (!text) return 0
  const counts: Record<string, number> = {}
  for (const ch of text) counts[ch] = (counts[ch] ?? 0) + 1
  const n = text.length
  let h = 0
  for (const c of Object.values(counts)) {
    const p = c / n
    h -= p * Math.log2(p)
  }
  return h
}

/** 线性映射：v 在 [from0, from1] 之间线性映射到 [to0, to1]，端点外裁剪 */
function remap(v: number, from0: number, from1: number, to0: number, to1: number): number {
  if (from0 === from1) return (to0 + to1) / 2
  const t = Math.max(0, Math.min(1, (v - from0) / (from1 - from0)))
  return to0 + (to1 - to0) * t
}

function splitSentences(text: string): string[] {
  return text
    .split(SENTENCE_SPLIT_RE)
    .map((s) => s.trim())
    .filter((s) => s.length >= 2)
}

function tokenizeForLang(text: string, language: 'zh' | 'en' | 'mixed'): string[] {
  if (language === 'en') return text.toLowerCase().match(EN_WORD_RE) ?? []
  // zh / mixed：以字为单位（剔除空白与标点）
  return Array.from(text).filter((ch) => /[一-鿿A-Za-z0-9]/.test(ch))
}

function ngramRepeatRatio(tokens: string[], n: number): number {
  if (tokens.length < n + 1) return 0
  const counts = new Map<string, number>()
  for (let i = 0; i <= tokens.length - n; i++) {
    const g = tokens.slice(i, i + n).join('|')
    counts.set(g, (counts.get(g) ?? 0) + 1)
  }
  let repeats = 0
  for (const c of counts.values()) if (c >= 2) repeats += c
  return repeats / (tokens.length - n + 1)
}

function mean(nums: number[]): number {
  if (nums.length === 0) return 0
  return nums.reduce((s, v) => s + v, 0) / nums.length
}

function stddev(nums: number[]): number {
  if (nums.length === 0) return 0
  const m = mean(nums)
  const variance = nums.reduce((s, v) => s + (v - m) ** 2, 0) / nums.length
  return Math.sqrt(variance)
}

const EN_STOPWORDS = ['the', 'of', 'and', 'to', 'in', 'a', 'is', 'that', 'for', 'with', 'as', 'on', 'by']
const ZH_STOPWORDS = ['的', '了', '是', '在', '和', '也', '就', '都', '与', '及']

/** 把文本切成 N 个窗口，计算每个窗口里 stopwords 占比 → 返回该序列的标准差 */
function stopwordWindowStd(text: string, lang: 'zh' | 'en' | 'mixed', windows = 6): number {
  if (text.length < windows * 20) return 0
  const stopwords = lang === 'en' ? EN_STOPWORDS : ZH_STOPWORDS
  const tokens =
    lang === 'en' ? text.toLowerCase().match(EN_WORD_RE) ?? [] : Array.from(text)
  if (tokens.length < windows) return 0
  const chunkSize = Math.floor(tokens.length / windows)
  const ratios: number[] = []
  for (let i = 0; i < windows; i++) {
    const chunk = tokens.slice(i * chunkSize, (i + 1) * chunkSize)
    const hit = chunk.filter((tk) => stopwords.includes(tk)).length
    ratios.push(chunk.length > 0 ? hit / chunk.length : 0)
  }
  return stddev(ratios)
}

/** 单句 AI 倾向打分：基于 AI 倾向词命中、长度规整、重复 token */
function scoreSentence(
  sentence: string,
  lang: 'zh' | 'en' | 'mixed',
): { score: number; reasons: string[] } {
  const reasons: string[] = []
  let score = 30

  // 1) AI 倾向词命中
  const lex = lang === 'en' ? EN_AI_LEXICON : ZH_AI_LEXICON
  let hits = 0
  if (lang === 'en') {
    const lower = sentence.toLowerCase()
    for (const w of lex) {
      const re = new RegExp(`\\b${w}\\b`, 'g')
      const c = (lower.match(re) ?? []).length
      if (c > 0) {
        hits += c
        reasons.push(w)
      }
    }
  } else {
    for (const w of lex) {
      if (sentence.includes(w)) {
        hits++
        reasons.push(w)
      }
    }
  }
  score += Math.min(40, hits * 20)

  // 2) 长句 + 多逗号"AI 套句"信号
  const commaCount = (sentence.match(/[,，;；]/g) ?? []).length
  if (sentence.length > 60 && commaCount >= 3) {
    score += 10
    reasons.push('long-with-clauses')
  }

  // 3) 句内 token 重复（同词出现 ≥ 3 次）
  const tokens =
    lang === 'en' ? sentence.toLowerCase().match(EN_WORD_RE) ?? [] : Array.from(sentence)
  const tcounts = new Map<string, number>()
  for (const t of tokens) tcounts.set(t, (tcounts.get(t) ?? 0) + 1)
  let repeatHits = 0
  for (const c of tcounts.values()) if (c >= 3) repeatHits++
  if (repeatHits > 0) {
    score += Math.min(10, repeatHits * 5)
    reasons.push('token-repeat')
  }

  return { score: Math.max(0, Math.min(100, score)), reasons }
}

export function analyzeText(text: string): TextAnalysis {
  const language = detectLanguage(text)
  const features: Feature[] = []
  const length = text.length

  const tokens = tokenizeForLang(text, language)
  const tokenCount = tokens.length
  const sentences = splitSentences(text)

  // 1) TTR：词汇多样性。低 → 偏 AI（重复套话）。
  const uniqueTokens = new Set(tokens).size
  const ttr = tokenCount > 0 ? uniqueTokens / tokenCount : 0
  // 中文偏低 (0.5)；英文较高 (0.6) 是常态；越低越像 AI 套话
  const ttrAnchorLow = language === 'en' ? 0.35 : 0.3
  const ttrAnchorHigh = language === 'en' ? 0.7 : 0.6
  features.push({
    key: 'ttr',
    rawLabel: 'TTR (Type-Token Ratio)',
    value: ttr.toFixed(3),
    contribution: Math.round(remap(ttr, ttrAnchorHigh, ttrAnchorLow, 20, 90)),
    weight: 0.15,
  })

  // 2) 句长方差：低 → AI 整齐
  const sentenceLens = sentences.map((s) => s.length)
  const sdSent = stddev(sentenceLens)
  features.push({
    key: 'sentence_std',
    rawLabel: 'Sentence-length stdev',
    value: sdSent.toFixed(1),
    // 中文 sd 通常 5–25；英文 8–35；越小越像 AI
    contribution: Math.round(remap(sdSent, language === 'en' ? 25 : 18, language === 'en' ? 6 : 4, 20, 90)),
    weight: 0.12,
  })

  // 2b) Burstiness（变异系数 CV）：人类波动大、AI 偏平
  const meanSent = mean(sentenceLens)
  const cv = meanSent > 0 ? sdSent / meanSent : 0
  features.push({
    key: 'burstiness',
    rawLabel: 'Sentence-length burstiness (CV)',
    value: cv.toFixed(2),
    contribution: Math.round(remap(cv, 0.8, 0.2, 20, 85)),
    weight: 0.12,
  })

  // 3) bigram 重复率：高 → 偏 AI（套话）
  const bigramRep = ngramRepeatRatio(tokens, 2)
  features.push({
    key: 'bigram_repeat',
    rawLabel: 'Bigram repeat ratio',
    value: bigramRep.toFixed(3),
    contribution: Math.round(remap(bigramRep, 0.02, 0.18, 20, 90)),
    weight: 0.15,
  })

  // 4) trigram 重复率
  const trigramRep = ngramRepeatRatio(tokens, 3)
  features.push({
    key: 'trigram_repeat',
    rawLabel: 'Trigram repeat ratio',
    value: trigramRep.toFixed(3),
    contribution: Math.round(remap(trigramRep, 0.005, 0.08, 20, 90)),
    weight: 0.1,
  })

  // 5) 字符熵：太低 (单调重复) 或太高（混乱）都可能异常；这里仅惩罚过低
  const entropy = shannonEntropy(text)
  features.push({
    key: 'entropy',
    rawLabel: 'Char Shannon entropy (bits)',
    value: entropy.toFixed(2),
    // 中文常 8–10，英文 4–5；过低 → 偏 AI；这里给中性偏低惩罚
    contribution: Math.round(remap(entropy, language === 'en' ? 5 : 9.5, language === 'en' ? 3 : 7.5, 20, 80)),
    weight: 0.1,
  })

  // 6) AI 倾向词命中密度
  const lex = language === 'en' ? EN_AI_LEXICON : ZH_AI_LEXICON
  let lexHits = 0
  if (language === 'en') {
    const lower = text.toLowerCase()
    for (const w of lex) {
      const re = new RegExp(`\\b${w}\\b`, 'g')
      lexHits += (lower.match(re) ?? []).length
    }
  } else {
    for (const w of lex) {
      const re = new RegExp(w, 'g')
      lexHits += (text.match(re) ?? []).length
    }
  }
  const lexDensity = sentences.length > 0 ? lexHits / sentences.length : 0
  features.push({
    key: 'ai_lexicon',
    rawLabel: 'AI-leaning word density (per sentence)',
    value: lexDensity.toFixed(3),
    contribution: Math.round(remap(lexDensity, 0.02, 0.6, 30, 95)),
    weight: 0.2,
  })

  // 7) 段落规整度：段落数与段落长度方差
  const paragraphs = text.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean)
  const paraLens = paragraphs.map((p) => p.length)
  const sdPara = stddev(paraLens)
  features.push({
    key: 'paragraph_std',
    rawLabel: 'Paragraph-length stdev',
    value: paragraphs.length > 1 ? sdPara.toFixed(1) : 'n/a',
    // 段落数过少不参与
    contribution: paragraphs.length <= 1 ? 50 : Math.round(remap(sdPara, 120, 20, 20, 85)),
    weight: paragraphs.length <= 1 ? 0.05 : 0.12,
  })

  // 8) 停用词窗口方差：人类波动大、AI 写作偏均匀
  const stopStd = stopwordWindowStd(text, language)
  features.push({
    key: 'stopword_std',
    rawLabel: 'Function-word ratio stdev (sliding)',
    value: stopStd.toFixed(3),
    contribution: Math.round(remap(stopStd, 0.06, 0.015, 25, 80)),
    weight: 0.1,
  })

  // 句级 AI 倾向打分 → 取分数 ≥ 60 的前 5 条
  const scored = sentences.map((s) => ({ text: s, ...scoreSentence(s, language) }))
  const suspiciousSentences = scored
    .filter((s) => s.score >= 60)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)

  return { language, length, features, suspiciousSentences }
}
