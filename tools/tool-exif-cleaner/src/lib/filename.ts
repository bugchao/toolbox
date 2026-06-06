/**
 * Pure filename helpers for EXIF cleaner.
 *
 * `addCleanSuffix` inserts `-clean` before the last extension. If the input
 * has no extension we just append `-clean`. The function preserves any leading
 * dot segments (e.g. `a.b.c.jpg` becomes `a.b.c-clean.jpg`).
 */
export function addCleanSuffix(name: string): string {
  if (!name) return '-clean'

  // Find the last dot that has at least one char before it. A leading dot
  // (e.g. ".env") is treated as part of the base name, not an extension.
  const lastDot = name.lastIndexOf('.')
  if (lastDot <= 0) {
    return `${name}-clean`
  }
  const base = name.slice(0, lastDot)
  const ext = name.slice(lastDot) // includes the dot
  return `${base}-clean${ext}`
}

/**
 * Swap an extension for the format we re-encoded to. Useful when the source
 * was a HEIC but we exported a JPEG.
 */
export function replaceExtension(name: string, newExt: string): string {
  const ext = newExt.startsWith('.') ? newExt : `.${newExt}`
  const lastDot = name.lastIndexOf('.')
  if (lastDot <= 0) {
    return `${name}${ext}`
  }
  return `${name.slice(0, lastDot)}${ext}`
}
