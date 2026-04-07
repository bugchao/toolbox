import React from 'react'
import { useLocation } from 'react-router-dom'
import { StandaloneButton } from './StandaloneButton'

interface ToolPageWrapperProps {
  children: React.ReactNode
  showStandaloneButton?: boolean
}

export function ToolPageWrapper({ children, showStandaloneButton = true }: ToolPageWrapperProps) {
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const isStandalone = searchParams.get('standalone') === 'true'

  return (
    <div className="relative">
      {/* 独立打开按钮 - 仅在非独立模式下显示 */}
      {!isStandalone && showStandaloneButton && (
        <div className="absolute top-0 right-0 z-10">
          <StandaloneButton />
        </div>
      )}
      {children}
    </div>
  )
}
