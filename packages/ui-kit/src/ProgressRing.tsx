import React from 'react'

export interface ProgressRingProps {
  value: number // 0-100
  size?: number
  strokeWidth?: number
  color?: string
  label?: React.ReactNode
  className?: string
}

export default function ProgressRing({
  value,
  size = 80,
  strokeWidth = 8,
  color = '#6366f1',
  label,
  className = '',
}: ProgressRingProps) {
  const r = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * r
  const offset = circumference - (value / 100) * circumference

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke="currentColor" strokeWidth={strokeWidth} className="text-gray-100 dark:text-gray-700" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s ease' }} />
      </svg>
      {label !== undefined && (
        <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-gray-700 dark:text-gray-200">
          {label}
        </div>
      )}
    </div>
  )
}
