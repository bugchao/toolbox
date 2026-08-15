export type MergeNameStrategy = 'collection' | 'summary' | 'custom'

export function sanitizeFilename(name: string): string {
  return name.replace(/[\\/:*?"<>|]/g, '').trim().slice(0, 100)
}

export function ensurePdfExt(name: string): string {
  return /\.pdf$/i.test(name) ? name : `${name}.pdf`
}

export function buildCollectionFilename(fileCount: number): string {
  return `${fileCount}个文件合集.pdf`
}

export function buildSummaryFilename(fileNames: string[]): string {
  const bases = fileNames.map((n) => sanitizeFilename(n.replace(/\.pdf$/i, '')))
  const shown = bases.slice(0, 3).join('_')
  const suffix = bases.length > 3 ? '等' : ''
  return ensurePdfExt(sanitizeFilename(`${shown}${suffix}`))
}

export function resolveMergeFilename(strategy: MergeNameStrategy, customName: string, fileNames: string[]): string {
  if (strategy === 'custom') {
    const trimmed = sanitizeFilename(customName)
    return ensurePdfExt(trimmed || '合并文件')
  }
  if (strategy === 'summary') return buildSummaryFilename(fileNames)
  return buildCollectionFilename(fileNames.length)
}
