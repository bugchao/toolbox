import { EFFECTS } from './effects'
import type { PipelineStep } from './types'

/** 按顺序把启用的效果链应用到 target canvas（target 尺寸取源图原始尺寸） */
export function applyPipeline(source: HTMLImageElement, steps: PipelineStep[], target: HTMLCanvasElement): void {
  const width = source.naturalWidth
  const height = source.naturalHeight
  target.width = width
  target.height = height
  const ctx = target.getContext('2d')
  if (!ctx || width === 0 || height === 0) return
  ctx.drawImage(source, 0, 0, width, height)

  // ponytail: 逐步骤全画布重绘，O(steps) 次 draw；大图卡顿时再合并相邻 filter 步骤
  let scratchCtx: CanvasRenderingContext2D | null = null

  for (const step of steps) {
    if (!step.enabled) continue
    const def = EFFECTS[step.type]
    if (def.kind === 'filter') {
      if (!scratchCtx) {
        const scratch = document.createElement('canvas')
        scratch.width = width
        scratch.height = height
        scratchCtx = scratch.getContext('2d')
        if (!scratchCtx) return
      }
      scratchCtx.clearRect(0, 0, width, height)
      scratchCtx.drawImage(target, 0, 0)
      ctx.filter = def.toFilter(step.value)
      ctx.clearRect(0, 0, width, height)
      ctx.drawImage(scratchCtx.canvas, 0, 0)
      ctx.filter = 'none'
    } else {
      const imageData = ctx.getImageData(0, 0, width, height)
      def.applyPixel({ data: imageData.data, width, height }, step.value)
      ctx.putImageData(imageData, 0, 0)
    }
  }
}
