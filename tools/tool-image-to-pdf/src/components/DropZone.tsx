import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Upload } from 'lucide-react'

export type DropZoneProps = {
  onFiles: (files: File[]) => void
  onSkipped?: (skipped: string[]) => void
}

const DropZone: React.FC<DropZoneProps> = ({ onFiles, onSkipped }) => {
  const { t } = useTranslation('toolImageToPdf')

  const handle = useCallback(
    (list: FileList | null) => {
      if (!list) return
      const accepted: File[] = []
      const skipped: string[] = []
      for (const f of Array.from(list)) {
        if (f.type.startsWith('image/')) accepted.push(f)
        else skipped.push(f.name)
      }
      if (accepted.length > 0) onFiles(accepted)
      if (skipped.length > 0 && onSkipped) onSkipped(skipped)
    },
    [onFiles, onSkipped],
  )

  return (
    <label
      htmlFor="image-to-pdf-input"
      onDrop={(e) => {
        e.preventDefault()
        handle(e.dataTransfer.files)
      }}
      onDragOver={(e) => e.preventDefault()}
      className="flex h-44 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-indigo-300 bg-indigo-50/50 text-center transition-colors hover:border-indigo-400 hover:bg-indigo-50 dark:border-indigo-700 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/30"
    >
      <Upload className="mb-2 h-8 w-8 text-indigo-500" />
      <span className="font-medium text-indigo-700 dark:text-indigo-200">{t('drop.cta')}</span>
      <span className="mt-1 text-xs text-indigo-500/80 dark:text-indigo-300/80">
        {t('drop.hint')}
      </span>
      <input
        id="image-to-pdf-input"
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handle(e.target.files)}
      />
    </label>
  )
}

export default DropZone
