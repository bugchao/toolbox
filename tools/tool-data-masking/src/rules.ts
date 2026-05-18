// 内置脱敏规则：仅基于正则 + 函数式替换，无 AI、纯本地
// 注意：以 \b 边界匹配会对中文/全角字符不可靠，我们用前后字符判断 ASCII 单词边界

export type RuleId =
  | 'mobile'
  | 'idCard'
  | 'email'
  | 'bankCard'
  | 'ipv4'
  | 'ipv6'
  | 'mac'
  | 'plate'
  | 'jwt'

export interface BuiltInRule {
  id: RuleId
  // 直接挂 RegExp（必须带 g）
  pattern: RegExp
  // 接收匹配到的整体串，返回脱敏后的串
  mask: (raw: string, ...groups: string[]) => string
}

const repeat = (ch: string, n: number) => (n <= 0 ? '' : new Array(n + 1).join(ch))

export const RULES: BuiltInRule[] = [
  {
    id: 'mobile',
    // 中国大陆手机号 1[3-9]\d{9}，前后不能紧跟 0-9 防止把更长串切错
    pattern: /(?<!\d)1[3-9]\d{9}(?!\d)/g,
    mask: (s) => `${s.slice(0, 3)}****${s.slice(7)}`,
  },
  {
    id: 'idCard',
    // 18 位身份证号（兼容 X/x 校验位）
    pattern: /(?<![0-9A-Za-z])\d{17}[\dXx](?![0-9A-Za-z])/g,
    mask: (s) => `${s.slice(0, 6)}********${s.slice(14)}`,
  },
  {
    id: 'email',
    pattern: /(?<![\w.%+-])([A-Za-z0-9._%+-]+)@([A-Za-z0-9.-]+\.[A-Za-z]{2,})/g,
    mask: (_, user: string, domain: string) => {
      if (user.length <= 2) return `${user[0] ?? ''}*@${domain}`
      return `${user[0]}${repeat('*', Math.max(1, user.length - 2))}${user[user.length - 1]}@${domain}`
    },
  },
  {
    id: 'bankCard',
    // 13-19 位连续数字。前后无数字字符。会与 idCard 冲突 → 处理顺序：身份证先匹配（更严格）
    pattern: /(?<!\d)\d{13,19}(?!\d)/g,
    mask: (s) => `${s.slice(0, 4)} **** **** ${s.slice(-4)}`,
  },
  {
    id: 'ipv4',
    pattern: /(?<!\d)((?:\d{1,3}\.){3})\d{1,3}(?!\d)/g,
    mask: (_, head: string) => {
      const parts = head.replace(/\.$/, '').split('.')
      // 保留前两段，后两段脱敏
      return `${parts[0]}.${parts[1]}.*.*`
    },
  },
  {
    id: 'ipv6',
    pattern: /(?<![0-9A-Fa-f:])(?:[0-9A-Fa-f]{1,4}:){2,}(?:[0-9A-Fa-f]{1,4}|:)(?:[0-9A-Fa-f]{1,4}:?)*(?![0-9A-Fa-f])/g,
    mask: (s) => {
      const head = s.split(':').slice(0, 2).join(':')
      return `${head}:****:****`
    },
  },
  {
    id: 'mac',
    pattern: /(?<![0-9A-Fa-f])([0-9A-Fa-f]{2})([:-])([0-9A-Fa-f]{2})\2([0-9A-Fa-f]{2})\2([0-9A-Fa-f]{2})\2([0-9A-Fa-f]{2})\2([0-9A-Fa-f]{2})(?![0-9A-Fa-f])/g,
    mask: (_, a: string, sep: string, b: string, _c: string, _d: string, _e: string, f: string) =>
      `${a}${sep}${b}${sep}**${sep}**${sep}**${sep}${f}`,
  },
  {
    id: 'plate',
    // 中国大陆车牌：省字 + 字母 + 5 位（其中第 5 位含挂学警等少量后缀），新能源 6 位
    pattern: /[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼][A-HJ-NP-Z][A-HJ-NP-Z0-9]{4,5}(?:挂|学|警|港|澳)?/g,
    mask: (s) => {
      if (s.length <= 4) return s
      return `${s.slice(0, 2)}${repeat('*', Math.max(2, s.length - 4))}${s.slice(-2)}`
    },
  },
  {
    id: 'jwt',
    // JWT: base64url.base64url.base64url
    pattern: /\b[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\b/g,
    mask: (s) => {
      const parts = s.split('.')
      return `${parts[0].slice(0, 6)}***.***.${parts[2].slice(-6)}`
    },
  },
]

export interface MatchInfo {
  rule: RuleId
  raw: string
  start: number
  end: number
}

export interface ApplyResult {
  output: string
  counts: Partial<Record<RuleId, number>>
  customCounts: Record<string, number>
}

export interface CustomRule {
  id: string
  name: string
  pattern: string
  flags: string
  replacement: string
  enabled: boolean
}

// 单次扫描全部启用规则，按"最长匹配 + 不重叠"贪心合并：
//  1. 先用启用的内置规则收集所有匹配
//  2. 再加入启用的自定义规则匹配
//  3. 按 start 升序、长度降序排序，遍历选择不冲突的匹配
//  4. 一次性替换
export function applyMasking(
  input: string,
  enabledBuiltIn: Set<RuleId>,
  customRules: CustomRule[],
): ApplyResult {
  if (!input) return { output: '', counts: {}, customCounts: {} }

  interface Hit {
    start: number
    end: number
    replacement: string
    ruleKey: string // either RuleId or `c:${id}`
  }
  const hits: Hit[] = []

  // built-in
  for (const rule of RULES) {
    if (!enabledBuiltIn.has(rule.id)) continue
    rule.pattern.lastIndex = 0
    let m: RegExpExecArray | null
    while ((m = rule.pattern.exec(input)) !== null) {
      const groups = m.slice(1)
      const replacement = rule.mask(m[0], ...groups)
      hits.push({ start: m.index, end: m.index + m[0].length, replacement, ruleKey: rule.id })
      if (m[0].length === 0) rule.pattern.lastIndex++
    }
  }

  // custom
  for (const c of customRules) {
    if (!c.enabled) continue
    let re: RegExp
    try {
      const flags = c.flags.includes('g') ? c.flags : c.flags + 'g'
      re = new RegExp(c.pattern, flags)
    } catch {
      continue // ignore invalid regex
    }
    let m: RegExpExecArray | null
    while ((m = re.exec(input)) !== null) {
      try {
        const replacement = m[0].replace(re, c.replacement) || c.replacement
        hits.push({
          start: m.index,
          end: m.index + m[0].length,
          replacement,
          ruleKey: `c:${c.id}`,
        })
      } catch {
        /* ignore replacement errors */
      }
      if (m[0].length === 0) re.lastIndex++
    }
  }

  // sort + de-overlap (greedy: longest first; if tied, earlier first)
  hits.sort((a, b) => {
    if (a.start !== b.start) return a.start - b.start
    return b.end - b.start - (a.end - a.start)
  })

  const selected: Hit[] = []
  let lastEnd = -1
  for (const h of hits) {
    if (h.start >= lastEnd) {
      selected.push(h)
      lastEnd = h.end
    }
  }

  // build output
  let out = ''
  let cursor = 0
  const counts: Partial<Record<RuleId, number>> = {}
  const customCounts: Record<string, number> = {}
  for (const h of selected) {
    if (h.start > cursor) out += input.slice(cursor, h.start)
    out += h.replacement
    cursor = h.end
    if (h.ruleKey.startsWith('c:')) {
      const id = h.ruleKey.slice(2)
      customCounts[id] = (customCounts[id] ?? 0) + 1
    } else {
      const id = h.ruleKey as RuleId
      counts[id] = (counts[id] ?? 0) + 1
    }
  }
  if (cursor < input.length) out += input.slice(cursor)
  return { output: out, counts, customCounts }
}
