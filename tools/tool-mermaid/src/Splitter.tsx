import React, { useCallback, useRef } from 'react'

// ponytail: 自写横向分割条（~40 行）而非引入 allotment/react-resizable-panels。
// 拖动改变左栏占比 [min,max]，右栏自适应；竖屏(md 以下)由外层改为上下堆叠时禁用。
interface SplitterProps {
  ratio: number
  onChange: (ratio: number) => void
  className?: string
}

const MIN = 0.2
const MAX = 0.8

const Splitter: React.FC<SplitterProps> = ({ ratio, onChange, className }) => {
  const dragging = useRef(false)
  const containerRef = useRef<HTMLElement | null>(null)

  const onMove = useCallback(
    (clientX: number) => {
      const el = containerRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const r = (clientX - rect.left) / rect.width
      onChange(Math.min(MAX, Math.max(MIN, r)))
    },
    [onChange],
  )

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    dragging.current = true
    containerRef.current = e.currentTarget.parentElement
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragging.current) onMove(e.clientX)
  }
  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    dragging.current = false
    e.currentTarget.releasePointerCapture(e.pointerId)
  }

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onDoubleClick={() => onChange(0.5)}
      className={
        'group relative w-2 shrink-0 cursor-col-resize touch-none select-none ' + (className ?? '')
      }
      title="拖动调整 · 双击重置"
    >
      <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-gray-200 group-hover:bg-indigo-400 dark:bg-gray-700" />
    </div>
  )
}

export default Splitter
