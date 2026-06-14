/** unified diff 生成 / 应用核心，jsdiff 包装。 */
import { applyPatch, createTwoFilesPatch, parsePatch } from 'diff'

export type MakePatchOptions = {
  /** hunk 上下文行数（默认 3） */
  context?: number
  oldName?: string
  newName?: string
}

/** 两段文本 → unified diff。内容相同返回 ''。 */
export function makePatch(oldText: string, newText: string, options: MakePatchOptions = {}): string {
  if (oldText === newText) return ''
  const patch = createTwoFilesPatch(
    options.oldName ?? 'a/file',
    options.newName ?? 'b/file',
    oldText,
    newText,
    undefined,
    undefined,
    { context: options.context ?? 3 },
  )
  return patch
}

export type ApplyResult =
  | { ok: true; text: string }
  | { ok: false; message: string }

/** 把 unified diff 应用到原文。容错失败 / 解析失败统一错误形态。 */
export function applyUnifiedPatch(source: string, patchText: string): ApplyResult {
  if (!patchText.trim()) return { ok: false, message: 'empty_patch' }
  try {
    // jsdiff 对无 hunk 的输入会"成功"返回原文 —— 显式拒绝，避免垃圾输入静默通过
    const parsed = parsePatch(patchText)
    const hunkCount = parsed.reduce((n, f) => n + f.hunks.length, 0)
    if (hunkCount === 0) return { ok: false, message: 'no_hunks' }
    const result = applyPatch(source, patchText)
    if (result === false) return { ok: false, message: 'hunk_mismatch' }
    return { ok: true, text: result }
  } catch (e) {
    return { ok: false, message: (e as Error).message ?? 'parse_failed' }
  }
}

export type PatchStats = {
  additions: number
  deletions: number
  hunks: number
}

/** 统计 patch 的 + / - 行数与 hunk 数。解析失败返回 null。 */
export function patchStats(patchText: string): PatchStats | null {
  if (!patchText.trim()) return null
  try {
    const parsed = parsePatch(patchText)
    let additions = 0
    let deletions = 0
    let hunks = 0
    for (const file of parsed) {
      hunks += file.hunks.length
      for (const hunk of file.hunks) {
        for (const line of hunk.lines) {
          if (line.startsWith('+')) additions += 1
          else if (line.startsWith('-')) deletions += 1
        }
      }
    }
    return { additions, deletions, hunks }
  } catch {
    return null
  }
}

export type DiffLineKind = 'add' | 'del' | 'context' | 'meta' | 'hunk'

/** 把 patch 文本按行分类，供 UI 着色。 */
export function classifyPatchLines(patchText: string): { kind: DiffLineKind; text: string }[] {
  return patchText.split('\n').map((text) => {
    if (text.startsWith('+++') || text.startsWith('---') || text.startsWith('Index:') || text.startsWith('====')) {
      return { kind: 'meta' as const, text }
    }
    if (text.startsWith('@@')) return { kind: 'hunk' as const, text }
    if (text.startsWith('+')) return { kind: 'add' as const, text }
    if (text.startsWith('-')) return { kind: 'del' as const, text }
    return { kind: 'context' as const, text }
  })
}
