import { describe, it, expect } from 'vitest'
import { analyzeText, detectLanguage } from './textFeatures'
import { aggregate, classify } from './score'

describe('detectLanguage', () => {
  it('detects Chinese-dominant', () => {
    expect(detectLanguage('这是一段中文文本')).toBe('zh')
  })

  it('detects English-dominant', () => {
    expect(detectLanguage('this is an English paragraph about cats')).toBe('en')
  })

  it('detects mixed', () => {
    expect(detectLanguage('mixed 中文 and English 文字 here')).toBe('mixed')
  })
})

describe('analyzeText', () => {
  it('returns features for English long text', () => {
    const text =
      'Furthermore, the comprehensive analysis underscores the multifaceted nature of the topic. Moreover, leveraging robust methodologies, we delve into the intricate dynamics. In conclusion, the findings are paramount.'
    const a = analyzeText(text)
    expect(a.language).toBe('en')
    expect(a.features.length).toBeGreaterThan(4)
    const lex = a.features.find((f) => f.key === 'ai_lexicon')
    expect(lex).toBeDefined()
    // 高密度的"AI 风格词"应推高贡献
    expect(lex!.contribution).toBeGreaterThan(60)
  })

  it('returns features for Chinese long text', () => {
    const text =
      '综上所述，深入探讨这个话题至关重要。值得注意的是，与此同时，我们必须凸显多方面的因素。然而，我们仍需助力相关研究。总而言之，全面的分析尤为关键。'
    const a = analyzeText(text)
    expect(a.language).toBe('zh')
    const lex = a.features.find((f) => f.key === 'ai_lexicon')
    expect(lex!.contribution).toBeGreaterThan(70)
  })

  it('every feature has contribution in [0,100]', () => {
    const a = analyzeText('Hello world. This is a short test sentence repeated. '.repeat(6))
    for (const f of a.features) {
      expect(f.contribution).toBeGreaterThanOrEqual(0)
      expect(f.contribution).toBeLessThanOrEqual(100)
    }
  })

  it('includes burstiness feature', () => {
    const a = analyzeText(
      'The cat sat on the mat. Then the cat jumped. Suddenly, a tiny dog ran in and barked loudly at the cat until the cat finally left the room in a hurry.',
    )
    expect(a.features.some((f) => f.key === 'burstiness')).toBe(true)
  })

  it('includes stopword window stdev feature', () => {
    const longish =
      'The quick brown fox jumps over the lazy dog repeatedly throughout this lengthy demonstration sentence. '.repeat(
        4,
      )
    const a = analyzeText(longish)
    expect(a.features.some((f) => f.key === 'stopword_std')).toBe(true)
  })

  it('returns suspicious sentences with AI-leaning content', () => {
    const text =
      'It was raining yesterday. ' +
      'Furthermore, this comprehensive analysis underscores the multifaceted nature of robust solutions in the modern era. ' +
      'Moreover, leveraging the meticulous methodology, the pivotal findings delve deeply into the intricate dynamics. ' +
      'The kids played outside. '
    const a = analyzeText(text)
    expect(a.suspiciousSentences.length).toBeGreaterThan(0)
    expect(a.suspiciousSentences[0].score).toBeGreaterThanOrEqual(60)
    expect(a.suspiciousSentences[0].reasons.length).toBeGreaterThan(0)
  })
})

describe('aggregate', () => {
  it('returns midpoint for empty features', () => {
    const r = aggregate([])
    expect(r.total).toBe(50)
    expect(r.verdict).toBe('suspect')
  })

  it('weights features correctly', () => {
    const r = aggregate([
      { key: 'a', rawLabel: 'A', value: 1, contribution: 90, weight: 1 },
      { key: 'b', rawLabel: 'B', value: 2, contribution: 10, weight: 1 },
    ])
    expect(r.total).toBe(50)
  })

  it('classifies edges', () => {
    expect(classify(0)).toBe('human')
    expect(classify(34.9)).toBe('human')
    expect(classify(35)).toBe('suspect')
    expect(classify(64.9)).toBe('suspect')
    expect(classify(65)).toBe('ai')
    expect(classify(100)).toBe('ai')
  })

  it('AI-heavy English text aggregates above 50', () => {
    const text =
      'Furthermore, this comprehensive overview underscores the multifaceted nature of the topic. Moreover, the robust analysis leverages meticulous research methods. In addition, the pivotal findings delve into the intricate dynamics. Furthermore, comprehensive insights underscore the paramount importance. Moreover, robust methods leverage delve into. '.repeat(2)
    const a = analyzeText(text)
    const r = aggregate(a.features)
    expect(r.total).toBeGreaterThan(50)
  })
})
