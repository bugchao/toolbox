// JSON → TypeScript 类型定义生成器
//
// 设计目标（最小但实用）：
//  - 嵌套对象提到顶层独立 interface，相互引用
//  - 数组元素如果都是对象 -> 合并字段（缺失字段标可选，类型差异合并为 union）
//  - 数组元素如果都是基础值 -> T[] 或 (T1|T2)[]
//  - 空数组 -> unknown[]

export type JsonToTsOptions = {
  /** 顶级类型名，默认 'Root' */
  rootName?: string
  /** 输出风格：interface 或 type */
  style?: 'interface' | 'type'
  /** 缩进，默认 2 空格 */
  indent?: number
}

type Field = { value: TypeNode; optional: boolean }
type ObjectShape = { fields: Record<string, Field>; order: string[] }

type TypeNode =
  | { kind: 'primitive'; type: 'string' | 'number' | 'boolean' | 'null' }
  | { kind: 'unknown' }
  | { kind: 'array'; element: TypeNode }
  | { kind: 'union'; members: TypeNode[] }
  | { kind: 'object'; ref: string }

type TypeMap = Map<string, ObjectShape>

const RESERVED_NAMES = new Set([
  'Root',
  'Object',
  'String',
  'Number',
  'Boolean',
  'Array',
])

function pascalCase(input: string): string {
  const cleaned = input.replace(/[^a-zA-Z0-9]+/g, ' ').trim()
  if (!cleaned) return 'Item'
  const parts = cleaned.split(/\s+/)
  let name = parts
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join('')
  if (/^[0-9]/.test(name)) name = '_' + name
  return name
}

function singularize(name: string): string {
  if (/ies$/i.test(name)) return name.replace(/ies$/i, 'y')
  if (/ses$/i.test(name)) return name.replace(/es$/i, '')
  if (/[^s]s$/.test(name)) return name.slice(0, -1)
  return name
}

function uniqueName(base: string, taken: Set<string>): string {
  let name = base
  if (RESERVED_NAMES.has(name)) name = name + 'Type'
  if (!taken.has(name)) {
    taken.add(name)
    return name
  }
  let i = 2
  while (taken.has(`${name}${i}`)) i++
  const next = `${name}${i}`
  taken.add(next)
  return next
}

function infer(
  value: unknown,
  hint: string,
  types: TypeMap,
  taken: Set<string>,
): TypeNode {
  if (value === null) return { kind: 'primitive', type: 'null' }
  const t = typeof value
  if (t === 'string') return { kind: 'primitive', type: 'string' }
  if (t === 'number') return { kind: 'primitive', type: 'number' }
  if (t === 'boolean') return { kind: 'primitive', type: 'boolean' }

  if (Array.isArray(value)) {
    if (value.length === 0) return { kind: 'array', element: { kind: 'unknown' } }
    const elementHint = singularize(hint) || 'Item'
    // 如果元素全部是对象，则合并成单个对象类型
    if (value.every((v) => v !== null && typeof v === 'object' && !Array.isArray(v))) {
      const merged = mergeObjects(value as Record<string, unknown>[], elementHint, types, taken)
      return { kind: 'array', element: merged }
    }
    const memberNodes = value.map((v) => infer(v, elementHint, types, taken))
    const element = unionFrom(memberNodes)
    return { kind: 'array', element }
  }

  if (t === 'object') {
    const obj = value as Record<string, unknown>
    return registerObject(obj, hint, types, taken)
  }

  return { kind: 'unknown' }
}

function registerObject(
  obj: Record<string, unknown>,
  hint: string,
  types: TypeMap,
  taken: Set<string>,
): TypeNode {
  const ref = uniqueName(pascalCase(hint) || 'Object', taken)
  const fields: Record<string, Field> = {}
  const order: string[] = []
  for (const key of Object.keys(obj)) {
    order.push(key)
    fields[key] = { value: infer(obj[key], key, types, taken), optional: false }
  }
  types.set(ref, { fields, order })
  return { kind: 'object', ref }
}

function mergeObjects(
  list: Record<string, unknown>[],
  hint: string,
  types: TypeMap,
  taken: Set<string>,
): TypeNode {
  const ref = uniqueName(pascalCase(hint) || 'Item', taken)
  const allKeys = new Set<string>()
  for (const item of list) for (const k of Object.keys(item)) allKeys.add(k)
  const fields: Record<string, Field> = {}
  const order: string[] = []
  for (const key of allKeys) {
    order.push(key)
    const presentValues: unknown[] = []
    let missing = false
    for (const item of list) {
      if (Object.prototype.hasOwnProperty.call(item, key)) {
        presentValues.push(item[key])
      } else {
        missing = true
      }
    }
    const memberNodes = presentValues.map((v) => infer(v, key, types, taken))
    fields[key] = { value: unionFrom(memberNodes), optional: missing }
  }
  types.set(ref, { fields, order })
  return { kind: 'object', ref }
}

function unionFrom(nodes: TypeNode[]): TypeNode {
  const dedupKeys = new Set<string>()
  const members: TypeNode[] = []
  for (const node of nodes) {
    const key = nodeKey(node)
    if (!dedupKeys.has(key)) {
      dedupKeys.add(key)
      members.push(node)
    }
  }
  if (members.length === 0) return { kind: 'unknown' }
  if (members.length === 1) return members[0]
  return { kind: 'union', members }
}

function nodeKey(node: TypeNode): string {
  switch (node.kind) {
    case 'primitive':
      return `p:${node.type}`
    case 'unknown':
      return 'u'
    case 'array':
      return `a[${nodeKey(node.element)}]`
    case 'object':
      return `o:${node.ref}`
    case 'union':
      return `(${node.members.map(nodeKey).sort().join('|')})`
  }
}

function renderNode(node: TypeNode): string {
  switch (node.kind) {
    case 'primitive':
      return node.type
    case 'unknown':
      return 'unknown'
    case 'array': {
      const inner = renderNode(node.element)
      return needsParensForArray(node.element) ? `(${inner})[]` : `${inner}[]`
    }
    case 'object':
      return node.ref
    case 'union':
      return node.members.map(renderNode).join(' | ')
  }
}

function needsParensForArray(node: TypeNode): boolean {
  return node.kind === 'union'
}

const SAFE_KEY = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/

function renderKey(key: string): string {
  return SAFE_KEY.test(key) ? key : JSON.stringify(key)
}

function renderShape(shape: ObjectShape, indentStr: string): string {
  const lines: string[] = []
  for (const key of shape.order) {
    const f = shape.fields[key]
    const optional = f.optional ? '?' : ''
    lines.push(`${indentStr}${renderKey(key)}${optional}: ${renderNode(f.value)};`)
  }
  return lines.join('\n')
}

export function jsonToTs(input: string, options: JsonToTsOptions = {}): string {
  const { rootName = 'Root', style = 'interface', indent = 2 } = options

  let parsed: unknown
  try {
    parsed = JSON.parse(input)
  } catch (e) {
    throw new SyntaxError((e as Error).message)
  }

  const types: TypeMap = new Map()
  const taken = new Set<string>()
  const rootBase = pascalCase(rootName) || 'Root'
  taken.add(rootBase) // 保留根名

  const rootNode = infer(parsed, rootBase, types, taken)
  const indentStr = ' '.repeat(indent)

  const blocks: string[] = []

  if (rootNode.kind === 'object') {
    // 把 rootNode.ref 对应的 shape 改名为用户指定的 rootBase
    const shape = types.get(rootNode.ref)!
    types.delete(rootNode.ref)
    types.set(rootBase, shape)
    blocks.push(renderDeclaration(rootBase, shape, style, indentStr))
    for (const [name, s] of types) {
      if (name === rootBase) continue
      blocks.push(renderDeclaration(name, s, style, indentStr))
    }
  } else {
    // 顶层不是对象：导出类型别名
    blocks.push(`export type ${rootBase} = ${renderNode(rootNode)};`)
    for (const [name, s] of types) {
      blocks.push(renderDeclaration(name, s, style, indentStr))
    }
  }

  return blocks.join('\n\n') + '\n'
}

function renderDeclaration(
  name: string,
  shape: ObjectShape,
  style: 'interface' | 'type',
  indentStr: string,
): string {
  const body = renderShape(shape, indentStr)
  if (style === 'interface') {
    return `export interface ${name} {\n${body}\n}`
  }
  return `export type ${name} = {\n${body}\n};`
}
