/** 在 input 中跑 regex，返回所有匹配（含 capture / index）。 */

export type MatchSpan = {
  index: number
  length: number
  full: string
  groups: (string | undefined)[]
  named?: Record<string, string | undefined>
}

export type MatchResult =
  | { ok: true; matches: MatchSpan[] }
  | { ok: false; message: string }

export function runMatches(pattern: string, flags: string, input: string): MatchResult {
  if (!pattern) return { ok: false, message: 'Empty pattern' }
  let re: RegExp
  try {
    // 强制 g 才能拿到所有匹配；保留其它 flag
    const effective = flags.includes('g') ? flags : flags + 'g'
    re = new RegExp(pattern, effective)
  } catch (e) {
    return { ok: false, message: (e as Error).message ?? 'Invalid regex' }
  }
  const out: MatchSpan[] = []
  let m: RegExpExecArray | null
  let safety = 0
  while ((m = re.exec(input)) !== null) {
    out.push({
      index: m.index,
      length: m[0].length,
      full: m[0],
      groups: m.slice(1),
      named: m.groups,
    })
    // 防止零宽匹配死循环
    if (m[0].length === 0) re.lastIndex += 1
    if (++safety > 50_000) {
      return { ok: false, message: 'Too many matches; aborted at 50,000.' }
    }
  }
  return { ok: true, matches: out }
}
