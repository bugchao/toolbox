import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { RotateCw, X } from 'lucide-react'
import type { ImageItem } from '../lib/buildPdf'

export type ImageGridProps = {
  items: ImageItem[]
  onReorder: (next: ImageItem[]) => void
  onRotate: (id: string) => void
  onRemove: (id: string) => void
}

const ImageGrid: React.FC<ImageGridProps> = ({ items, onReorder, onRotate, onRemove }) => {
  const { t } = useTranslation('toolImageToPdf')
  const [draggingId, setDraggingId] = useState<string | null>(null)

  const onDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    setDraggingId(id)
    e.dataTransfer.effectAllowed = 'move'
  }

  const onDrop = (targetId: string) => {
    if (!draggingId || draggingId === targetId) return
    const fromIdx = items.findIndex((x) => x.id === draggingId)
    const toIdx = items.findIndex((x) => x.id === targetId)
    if (fromIdx === -1 || toIdx === -1) return
    const next = items.slice()
    const [moved] = next.splice(fromIdx, 1)
    next.splice(toIdx, 0, moved)
    onReorder(next)
    setDraggingId(null)
  }

  if (items.length === 0) return null

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {items.map((it, idx) => {
        const url = it.url
        return (
          <div
            key={it.id}
            draggable
            onDragStart={(e) => onDragStart(e, it.id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => onDrop(it.id)}
            className={[
              'group relative aspect-square overflow-hidden rounded-xl border border-gray-200 bg-gray-50 transition-shadow dark:border-gray-700 dark:bg-gray-900/40',
              draggingId === it.id ? 'opacity-50' : '',
              'cursor-grab hover:shadow-md active:cursor-grabbing',
            ].join(' ')}
          >
            {url && (
              <img
                src={url}
                alt={it.file.name}
                className="absolute inset-0 h-full w-full object-contain transition-transform"
                style={{ transform: `rotate(${it.rotation}deg)` }}
                draggable={false}
              />
            )}
            <div className="absolute left-1 top-1 rounded bg-black/60 px-1.5 py-0.5 text-xs font-bold text-white">
              {idx + 1}
            </div>
            <div className="absolute right-1 top-1 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                type="button"
                onClick={() => onRotate(it.id)}
                title={t('grid.rotate')}
                className="rounded-full bg-black/60 p-1.5 text-white hover:bg-black"
              >
                <RotateCw className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onRemove(it.id)}
                title={t('grid.remove')}
                className="rounded-full bg-rose-600/90 p-1.5 text-white hover:bg-rose-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/70 to-transparent px-2 pb-1 pt-3 text-xs text-white">
              {it.file.name}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default ImageGrid
