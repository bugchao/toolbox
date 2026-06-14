/**
 * 简化 IR（intermediate representation）：把 regexp-tree AST 归一成 5 类节点。
 * Renderer 只看 IR，不直接 import regexp-tree —— 让两个责任分开。
 */

export type IrNode =
  | { kind: 'seq'; items: IrNode[] }
  | { kind: 'choice'; options: IrNode[] }
  | { kind: 'optional'; inner: IrNode }                      // x?
  | { kind: 'star'; inner: IrNode }                          // x*
  | { kind: 'plus'; inner: IrNode }                          // x+
  | { kind: 'repeat'; inner: IrNode; min: number; max: number | null } // x{n,m}
  | { kind: 'group'; inner: IrNode; capturing: boolean; name?: string }
  | { kind: 'term'; label: string; tone?: 'literal' | 'class' | 'anchor' | 'backref' | 'meta' }

type RxNode = { type: string; [k: string]: unknown }

function alt(items: IrNode[]): IrNode {
  if (items.length === 0) return { kind: 'term', label: 'ε', tone: 'meta' }
  if (items.length === 1) return items[0]
  return { kind: 'seq', items }
}

export function toIr(ast: unknown): IrNode {
  const root = ast as RxNode & { body?: RxNode }
  if (!root.body) return { kind: 'term', label: '∅', tone: 'meta' }
  return walk(root.body)
}

function walk(node: RxNode): IrNode {
  switch (node.type) {
    case 'Disjunction': {
      // 收集所有同级 |：A|B|C 在 regexp-tree 里嵌套成 Disjunction(left=Disjunction(...), right=C)
      const opts: IrNode[] = []
      collectDisjunction(node, opts)
      return { kind: 'choice', options: opts }
    }
    case 'Alternative': {
      const expressions = (node.expressions as RxNode[]) ?? []
      return alt(expressions.map(walk))
    }
    case 'Char':
      return { kind: 'term', label: displayChar(node), tone: 'literal' }
    case 'CharacterClass':
      return { kind: 'term', label: formatCharClass(node), tone: 'class' }
    case 'Group': {
      const inner = walk(node.expression as RxNode)
      return {
        kind: 'group',
        inner,
        capturing: (node.capturing as boolean | undefined) ?? false,
        name: node.name as string | undefined,
      }
    }
    case 'Backreference': {
      const ref = node.reference != null ? String(node.reference) : ''
      return { kind: 'term', label: `\\${ref}`, tone: 'backref' }
    }
    case 'Assertion':
      return { kind: 'term', label: formatAssertion(node), tone: 'anchor' }
    case 'Repetition': {
      const inner = walk(node.expression as RxNode)
      const q = (node.quantifier as RxNode | undefined) ?? { type: 'Quantifier', kind: '?' }
      return applyQuantifier(inner, q)
    }
    default:
      return { kind: 'term', label: node.type, tone: 'meta' }
  }
}

function collectDisjunction(node: RxNode, into: IrNode[]) {
  const left = node.left as RxNode | undefined
  const right = node.right as RxNode | undefined
  if (left?.type === 'Disjunction') collectDisjunction(left, into)
  else if (left) into.push(walk(left))
  if (right?.type === 'Disjunction') collectDisjunction(right, into)
  else if (right) into.push(walk(right))
}

function applyQuantifier(inner: IrNode, q: RxNode): IrNode {
  const kind = String(q.kind ?? '')
  if (kind === '?') return { kind: 'optional', inner }
  if (kind === '*') return { kind: 'star', inner }
  if (kind === '+') return { kind: 'plus', inner }
  if (kind === 'Range') {
    const from = typeof q.from === 'number' ? q.from : 0
    const to = typeof q.to === 'number' ? q.to : null
    if (from === 0 && to == null) return { kind: 'star', inner }
    if (from === 1 && to == null) return { kind: 'plus', inner }
    if (from === 0 && to === 1) return { kind: 'optional', inner }
    return { kind: 'repeat', inner, min: from, max: to }
  }
  return inner
}

function displayChar(node: RxNode): string {
  const value = node.value as string | undefined
  const codePoint = node.codePoint as number | undefined
  if (typeof value === 'string' && value.length > 0) return value
  if (typeof codePoint === 'number') return String.fromCodePoint(codePoint)
  const symbol = node.symbol as string | undefined
  return symbol ?? '?'
}

function formatCharClass(node: RxNode): string {
  const expressions = (node.expressions as RxNode[]) ?? []
  const negative = (node.negative as boolean | undefined) ?? false
  const parts = expressions.map((e) => {
    if (e.type === 'ClassRange') {
      const from = e.from as RxNode
      const to = e.to as RxNode
      return `${displayChar(from)}-${displayChar(to)}`
    }
    return displayChar(e)
  })
  return `[${negative ? '^' : ''}${parts.join('')}]`
}

function formatAssertion(node: RxNode): string {
  const kind = String(node.kind ?? '')
  if (kind === '^') return '^ (start)'
  if (kind === '$') return '$ (end)'
  if (kind === '\\b') return '\\b (boundary)'
  if (kind === '\\B') return '\\B (non-boundary)'
  if (kind === 'Lookahead') return node.negative ? '(?!…)' : '(?=…)'
  if (kind === 'Lookbehind') return node.negative ? '(?<!…)' : '(?<=…)'
  return kind || '?'
}
