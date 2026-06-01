import type { ShadowLayer } from './shadow'

let counter = 0
function nextId(): string {
  counter += 1
  return `l${Date.now().toString(36)}-${counter.toString(36)}`
}

export function createLayer(partial: Partial<ShadowLayer> = {}): ShadowLayer {
  return {
    id: partial.id ?? nextId(),
    x: partial.x ?? 0,
    y: partial.y ?? 4,
    blur: partial.blur ?? 8,
    spread: partial.spread ?? 0,
    color: partial.color ?? '#000000',
    alpha: partial.alpha ?? 0.25,
    inset: partial.inset ?? false,
  }
}

/** 返回新数组（不可变）。 */
export function addLayer(layers: ShadowLayer[], next?: Partial<ShadowLayer>): ShadowLayer[] {
  return [...layers, createLayer(next)]
}

export function removeLayer(layers: ShadowLayer[], id: string): ShadowLayer[] {
  return layers.filter((l) => l.id !== id)
}

export function updateLayer(
  layers: ShadowLayer[],
  id: string,
  patch: Partial<ShadowLayer>,
): ShadowLayer[] {
  return layers.map((l) => (l.id === id ? { ...l, ...patch } : l))
}

/** 上/下移动指定 id 的层；越界则保持不变。 */
export function moveLayer(layers: ShadowLayer[], id: string, dir: 'up' | 'down'): ShadowLayer[] {
  const idx = layers.findIndex((l) => l.id === id)
  if (idx === -1) return layers
  const target = dir === 'up' ? idx - 1 : idx + 1
  if (target < 0 || target >= layers.length) return layers
  const next = layers.slice()
  ;[next[idx], next[target]] = [next[target], next[idx]]
  return next
}
