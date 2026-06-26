/** 语义化版本（SemVer 2.0）解析 / 比较 / 排序 / 范围匹配。零依赖纯函数。 */

export type SemVer = {
  major: number
  minor: number
  patch: number
  prerelease: string[] // 点分标识符
  build: string[]
}

const RE = /^v?(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?(?:\+([0-9A-Za-z.-]+))?$/

export function parse(input: string): SemVer | null {
  const m = input.trim().match(RE)
  if (!m) return null
  return {
    major: Number(m[1]),
    minor: Number(m[2]),
    patch: Number(m[3]),
    prerelease: m[4] ? m[4].split('.') : [],
    build: m[5] ? m[5].split('.') : [],
  }
}

export function isValid(input: string): boolean {
  return parse(input) !== null
}

export function format(v: SemVer): string {
  let s = `${v.major}.${v.minor}.${v.patch}`
  if (v.prerelease.length) s += '-' + v.prerelease.join('.')
  if (v.build.length) s += '+' + v.build.join('.')
  return s
}

/** 比较预发布标识符（SemVer §11）。无预发布 > 有预发布。 */
function comparePrerelease(a: string[], b: string[]): number {
  if (a.length === 0 && b.length === 0) return 0
  if (a.length === 0) return 1 // a 是正式版，大
  if (b.length === 0) return -1
  const len = Math.min(a.length, b.length)
  for (let i = 0; i < len; i++) {
    const ai = a[i]; const bi = b[i]
    const an = /^\d+$/.test(ai); const bn = /^\d+$/.test(bi)
    if (an && bn) {
      const d = Number(ai) - Number(bi)
      if (d !== 0) return d < 0 ? -1 : 1
    } else if (an) {
      return -1 // 数字标识符 < 字母标识符
    } else if (bn) {
      return 1
    } else {
      if (ai < bi) return -1
      if (ai > bi) return 1
    }
  }
  return a.length - b.length === 0 ? 0 : a.length < b.length ? -1 : 1
}

/** 主比较：-1 / 0 / 1。build metadata 不参与比较。 */
export function compare(a: SemVer, b: SemVer): number {
  if (a.major !== b.major) return a.major < b.major ? -1 : 1
  if (a.minor !== b.minor) return a.minor < b.minor ? -1 : 1
  if (a.patch !== b.patch) return a.patch < b.patch ? -1 : 1
  return comparePrerelease(a.prerelease, b.prerelease)
}

/** 比较两个版本字符串；非法抛错（caller 应先校验）。 */
export function compareStrings(a: string, b: string): number {
  const pa = parse(a); const pb = parse(b)
  if (!pa || !pb) throw new Error('invalid version')
  return compare(pa, pb)
}

export function eq(a: string, b: string): boolean { return compareStrings(a, b) === 0 }
export function gt(a: string, b: string): boolean { return compareStrings(a, b) > 0 }
export function lt(a: string, b: string): boolean { return compareStrings(a, b) < 0 }

/** 排序版本字符串数组（升序），跳过非法项。 */
export function sortVersions(list: string[], desc = false): string[] {
  const valid = list.filter(isValid)
  valid.sort((a, b) => compareStrings(a, b))
  return desc ? valid.reverse() : valid
}

export type DiffLevel = 'major' | 'minor' | 'patch' | 'prerelease' | 'none'

/** 两版本的差异级别。 */
export function diff(a: string, b: string): DiffLevel | null {
  const pa = parse(a); const pb = parse(b)
  if (!pa || !pb) return null
  if (pa.major !== pb.major) return 'major'
  if (pa.minor !== pb.minor) return 'minor'
  if (pa.patch !== pb.patch) return 'patch'
  if (comparePrerelease(pa.prerelease, pb.prerelease) !== 0) return 'prerelease'
  return 'none'
}

// ───────────── 范围匹配 ─────────────

/** 单个比较式：op + 版本。 */
type Comparator = { op: '<' | '<=' | '>' | '>=' | '='; v: SemVer }

function cmp(version: SemVer, c: Comparator): boolean {
  const r = compare(version, c.v)
  switch (c.op) {
    case '<': return r < 0
    case '<=': return r <= 0
    case '>': return r > 0
    case '>=': return r >= 0
    case '=': return r === 0
  }
}

/** 把 ^ ~ 等糖展开成一组比较式（AND）。 */
function expandToken(tok: string): Comparator[] | null {
  tok = tok.trim()
  if (tok === '' || tok === '*' || tok === 'x') return [] // 任意
  // ^ caret
  if (tok.startsWith('^')) {
    const v = parse(tok.slice(1)); if (!v) return null
    const upper: SemVer = v.major > 0
      ? { ...v, major: v.major + 1, minor: 0, patch: 0, prerelease: [], build: [] }
      : v.minor > 0
        ? { ...v, minor: v.minor + 1, patch: 0, prerelease: [], build: [] }
        : { ...v, patch: v.patch + 1, prerelease: [], build: [] }
    return [{ op: '>=', v }, { op: '<', v: upper }]
  }
  // ~ tilde
  if (tok.startsWith('~')) {
    const v = parse(tok.slice(1)); if (!v) return null
    const upper: SemVer = { ...v, minor: v.minor + 1, patch: 0, prerelease: [], build: [] }
    return [{ op: '>=', v }, { op: '<', v: upper }]
  }
  // >= <= > < =
  const m = tok.match(/^(>=|<=|>|<|=)?\s*(.+)$/)
  if (!m) return null
  const op = (m[1] || '=') as Comparator['op']
  const v = parse(m[2])
  if (!v) return null
  return [{ op, v }]
}

/** 判断版本是否满足范围（支持空格 AND、`||` OR、^ ~ 比较式）。 */
export function satisfies(version: string, range: string): boolean {
  const v = parse(version)
  if (!v) return false
  const orParts = range.split('||')
  for (const part of orParts) {
    const tokens = part.trim().split(/\s+/).filter(Boolean)
    let allMatch = true
    for (const tok of tokens) {
      const comps = expandToken(tok)
      if (comps === null) { allMatch = false; break }
      if (!comps.every((c) => cmp(v, c))) { allMatch = false; break }
    }
    if (allMatch) return true
  }
  return false
}

/** 在候选里挑满足 range 的最高版本。 */
export function maxSatisfying(versions: string[], range: string): string | null {
  const ok = versions.filter((x) => isValid(x) && satisfies(x, range))
  if (ok.length === 0) return null
  return sortVersions(ok, true)[0]
}

/** 版本号自增。 */
export function inc(version: string, level: 'major' | 'minor' | 'patch'): string | null {
  const v = parse(version)
  if (!v) return null
  if (level === 'major') return format({ major: v.major + 1, minor: 0, patch: 0, prerelease: [], build: [] })
  if (level === 'minor') return format({ ...v, minor: v.minor + 1, patch: 0, prerelease: [], build: [] })
  return format({ ...v, patch: v.patch + 1, prerelease: [], build: [] })
}
