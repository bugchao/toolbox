import React from 'react'
import { animated, useSpring } from '@react-spring/web'

export interface ParallaxProps {
  children: React.ReactNode
  /** 滚动偏移系数，越大视差越明显（如 0.2） */
  offset?: number
  className?: string
}

/**
 * 视差滚动区块，内容随滚动轻微位移（弹簧过渡）
 */
const Parallax: React.FC<ParallaxProps> = ({
  children,
  offset = 0.15,
  className = '',
}) => {
  const ref = React.useRef<HTMLDivElement>(null)
  const [y, setY] = React.useState(0)

  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    const onScroll = () => {
      const rect = el.getBoundingClientRect()
      const center = rect.top + rect.height / 2
      const viewportCenter = window.innerHeight / 2
      setY((center - viewportCenter) * offset)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [offset])

  const style = useSpring({ y, config: { mass: 0.5, tension: 200, friction: 20 } })
  return (
    <div ref={ref} className={className}>
      <animated.div
        style={{ transform: style.y.to((v) => `translateY(${v}px)`) }}
      >
        {children}
      </animated.div>
    </div>
  )
}

export default Parallax
