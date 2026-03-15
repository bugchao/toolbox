import React, { useState } from 'react'
import { useSpring, animated } from '@react-spring/web'
import { cn } from '../lib/cn'

export interface FlipCardProps {
  /** 正面内容 */
  front: React.ReactNode
  /** 背面内容 */
  back: React.ReactNode
  /** 是否默认显示背面 */
  defaultFlipped?: boolean
  className?: string
  /** 卡片内边距（与 Card 一致） */
  padded?: boolean
}

/**
 * 正反面翻转卡片，用于说明/结果切换、配置/预览等
 */
const FlipCard: React.FC<FlipCardProps> = ({
  front,
  back,
  defaultFlipped = false,
  className = '',
  padded = true,
}) => {
  const [flipped, setFlipped] = useState(defaultFlipped)
  const { rotateY } = useSpring({
    rotateY: flipped ? 180 : 0,
    config: { tension: 200, friction: 20 },
  })

  return (
    <div
      className={cn('relative w-full cursor-pointer select-none', className)}
      style={{ perspective: '1000px' }}
      onClick={() => setFlipped((b) => !b)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          setFlipped((b) => !b)
        }
      }}
    >
      <animated.div
        className="relative w-full h-full"
        style={{
          transform: rotateY.to((r) => `rotateY(${r}deg)`),
          transformStyle: 'preserve-3d',
        }}
      >
        <div
          className={cn(
            'absolute inset-0 w-full h-full rounded-xl bg-white dark:bg-gray-800 shadow-lg dark:shadow-black/20 border border-gray-200 dark:border-gray-700',
            padded && 'p-6 sm:p-8'
          )}
          style={{ backfaceVisibility: 'hidden' }}
        >
          {front}
        </div>
        <div
          className={cn(
            'absolute inset-0 w-full h-full rounded-xl bg-white dark:bg-gray-800 shadow-lg dark:shadow-black/20 border border-gray-200 dark:border-gray-700',
            padded && 'p-6 sm:p-8'
          )}
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          {back}
        </div>
      </animated.div>
    </div>
  )
}

export default FlipCard
