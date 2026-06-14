/** 命名风格转换核心：先分词，再按目标风格重组。零依赖，纯函数。 */

export type CaseId =
  | 'camel'
  | 'pascal'
  | 'snake'
  | 'constant'
  | 'kebab'
  | 'cobol'
  | 'train'
  | 'title'
  | 'sentence'
  | 'lower'
  | 'upper'
  | 'dot'
  | 'path'

/**
 * 把任意字符串拆成小写词数组。识别边界：
 * - 分隔符（空格 / _ / - / . / / 等非字母数字）
 * - camelCase 驼峰边界（aB）
 * - 连续大写后接小写（HTTPServer → HTTP Server）
 * - 字母↔数字边界（v2 → v / 2 视情况；这里保留 v2 不拆，仅在字母数字交界保留为同词的策略：拆开更通用）
 */
export function tokenize(input: string): string[] {
  if (!input) return []
  // 1) 非字母数字 → 空格
  let s = input.replace(/[^\p{L}\p{N}]+/gu, ' ')
  // 2) 小写/数字 后接 大写 → 插空格（fooBar / foo2Bar）
  s = s.replace(/([\p{Ll}\p{N}])(\p{Lu})/gu, '$1 $2')
  // 3) 连续大写 后接 大写+小写 → 插空格（HTTPServer → HTTP Server）
  s = s.replace(/(\p{Lu}+)(\p{Lu}\p{Ll})/gu, '$1 $2')
  // 4) 字母 后接 数字 → 插空格（version2 → version 2）
  s = s.replace(/(\p{L})(\p{N})/gu, '$1 $2')
  // 5) 数字 后接 字母 → 插空格（2nd → 2 nd）
  s = s.replace(/(\p{N})(\p{L})/gu, '$1 $2')
  return s
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.toLowerCase())
}

function cap(word: string): string {
  if (!word) return word
  return word.charAt(0).toUpperCase() + word.slice(1)
}

export function convertCase(input: string, target: CaseId): string {
  const words = tokenize(input)
  if (words.length === 0) return ''
  switch (target) {
    case 'camel':
      return words.map((w, i) => (i === 0 ? w : cap(w))).join('')
    case 'pascal':
      return words.map(cap).join('')
    case 'snake':
      return words.join('_')
    case 'constant':
      return words.map((w) => w.toUpperCase()).join('_')
    case 'kebab':
      return words.join('-')
    case 'cobol':
      return words.map((w) => w.toUpperCase()).join('-')
    case 'train':
      return words.map(cap).join('-')
    case 'title':
      return words.map(cap).join(' ')
    case 'sentence':
      return cap(words.join(' '))
    case 'lower':
      return words.join(' ')
    case 'upper':
      return words.map((w) => w.toUpperCase()).join(' ')
    case 'dot':
      return words.join('.')
    case 'path':
      return words.join('/')
  }
}

export type CaseDef = { id: CaseId; sample: string }

/** 展示用：每种风格的样例（用 "hello world example" 渲染）。 */
export const CASE_DEFS: CaseDef[] = [
  { id: 'camel', sample: convertCase('hello world example', 'camel') },
  { id: 'pascal', sample: convertCase('hello world example', 'pascal') },
  { id: 'snake', sample: convertCase('hello world example', 'snake') },
  { id: 'constant', sample: convertCase('hello world example', 'constant') },
  { id: 'kebab', sample: convertCase('hello world example', 'kebab') },
  { id: 'cobol', sample: convertCase('hello world example', 'cobol') },
  { id: 'train', sample: convertCase('hello world example', 'train') },
  { id: 'title', sample: convertCase('hello world example', 'title') },
  { id: 'sentence', sample: convertCase('hello world example', 'sentence') },
  { id: 'lower', sample: convertCase('hello world example', 'lower') },
  { id: 'upper', sample: convertCase('hello world example', 'upper') },
  { id: 'dot', sample: convertCase('hello world example', 'dot') },
  { id: 'path', sample: convertCase('hello world example', 'path') },
]

/** 批量：逐行转换，空行保留。 */
export function convertLines(text: string, target: CaseId): string {
  return text.split('\n').map((line) => (line.trim() ? convertCase(line, target) : line)).join('\n')
}
