import React from 'react'
import { motion } from 'motion/react'

export interface StaggerChildrenProps {
  children: React.ReactNode
  /** 子项间隔（秒） */
  stagger?: number
  className?: string
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
}

const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 },
}

/**
 * 子元素错开动画容器，用于列表/卡片依次出现
 */
const StaggerChildren: React.FC<StaggerChildrenProps> = ({
  children,
  stagger = 0.05,
  className = '',
}) => {
  return (
    <motion.div
      variants={{
        ...container,
        show: { ...container.show, transition: { staggerChildren: stagger } },
      }}
      initial="hidden"
      animate="show"
      className={className}
    >
      {React.Children.map(children, (child) => (
        <motion.div variants={item}>{child}</motion.div>
      ))}
    </motion.div>
  )
}

export default StaggerChildren
