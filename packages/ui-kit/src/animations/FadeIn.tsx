import React from 'react'
import { motion } from 'motion/react'

export interface FadeInProps {
  children: React.ReactNode
  /** 延迟（秒） */
  delay?: number
  /** 持续时间（秒） */
  duration?: number
  /** 是否从下方轻微位移 */
  y?: number
  className?: string
}

/**
 * 淡入动画，工具页区块入场用
 */
const FadeIn: React.FC<FadeInProps> = ({
  children,
  delay = 0,
  duration = 0.4,
  y = 8,
  className = '',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export default FadeIn
