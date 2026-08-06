import React, { useEffect } from 'react'

export interface ModalProps {
  onClose: () => void
  children: React.ReactNode
  /** 内容卡片的 className（尺寸、背景、圆角等） */
  className?: string
  /** 遮罩层 className，默认 bg-black/40 backdrop-blur-sm p-4 */
  overlayClassName?: string
  /** 点击遮罩是否关闭，默认 true */
  closeOnBackdrop?: boolean
}

const DEFAULT_OVERLAY = 'bg-black/40 backdrop-blur-sm p-4'

/**
 * 受控挂载的居中弹窗：挂载即视为打开，卸载（父组件条件渲染）即关闭。
 * 统一 Escape 关闭 + 点击遮罩关闭，替代各工具内重复的同款 fixed inset-0 覆盖层。
 */
export default function Modal({
  onClose,
  children,
  className = '',
  overlayClassName = DEFAULT_OVERLAY,
  closeOnBackdrop = true,
}: ModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center ${overlayClassName}`}
      onClick={closeOnBackdrop ? onClose : undefined}
      role="dialog"
      aria-modal="true"
    >
      <div onClick={(e) => e.stopPropagation()} className={className}>
        {children}
      </div>
    </div>
  )
}
