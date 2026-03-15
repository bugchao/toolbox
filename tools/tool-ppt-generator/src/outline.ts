export const SLIDE_SEP = '---'
export const BULLET_PATTERN = /^[\-\•]\s*/

export interface ParsedSlide {
  title: string
  bullets: string[]
}

export function parseOutline(text: string): ParsedSlide[] {
  const blocks = text.trim().split(/\n\s*---\s*\n/).map((b) => b.trim()).filter(Boolean)
  return blocks.map((block) => {
    const lines = block.split('\n').map((s) => s.trim()).filter(Boolean)
    const title = lines[0] || ''
    const bullets = lines.slice(1).map((line) => line.replace(BULLET_PATTERN, '')).filter(Boolean)
    return { title, bullets }
  })
}
