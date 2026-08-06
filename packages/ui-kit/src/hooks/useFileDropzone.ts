import { useCallback, useRef, useState } from 'react'

export interface UseFileDropzoneOptions {
  onFiles: (files: File[]) => void
  disabled?: boolean
}

/**
 * 封装拖拽上传的重复逻辑：拖拽计数器（避免子元素触发的 dragenter/dragleave 闪烁）、
 * 隐藏 input 的 ref/点击/onChange 清空。不涉及具体样式，各工具自行渲染外层容器与提示文案。
 */
export function useFileDropzone({ onFiles, disabled = false }: UseFileDropzoneOptions) {
  const [isDragActive, setIsDragActive] = useState(false)
  const dragCounter = useRef(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const openPicker = useCallback(() => {
    if (!disabled) inputRef.current?.click()
  }, [disabled])

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      dragCounter.current = 0
      setIsDragActive(false)
      if (disabled) return
      const files = Array.from(e.dataTransfer.files)
      if (files.length > 0) onFiles(files)
    },
    [disabled, onFiles],
  )

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const onDragEnter = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      if (disabled) return
      dragCounter.current += 1
      setIsDragActive(true)
    },
    [disabled],
  )

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    dragCounter.current = Math.max(0, dragCounter.current - 1)
    if (dragCounter.current === 0) setIsDragActive(false)
  }, [])

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? [])
      e.target.value = ''
      if (files.length > 0) onFiles(files)
    },
    [onFiles],
  )

  return {
    isDragActive,
    inputRef,
    openPicker,
    dropzoneProps: { onDrop, onDragOver, onDragEnter, onDragLeave },
    inputProps: { ref: inputRef, type: 'file' as const, className: 'hidden', onChange: onInputChange },
  }
}
