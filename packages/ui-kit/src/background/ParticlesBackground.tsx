import React, { useEffect, useMemo, useState } from 'react'
import Particles, { initParticlesEngine } from '@tsparticles/react'
import { loadSlim } from '@tsparticles/slim'
import { useBackgroundVisibility } from './BackgroundVisibilityContext'
import {
  particlesPresets,
  type ParticlesPresetKey,
} from './particlesPresets'
import { cn } from '../lib/cn'

export interface ParticlesBackgroundProps {
  /** 预设名称，每个工具可选用不同预设 */
  preset?: ParticlesPresetKey
  /** 自定义配置，覆盖预设 */
  options?: Record<string, unknown>
  /** 容器 className，通常固定定位铺满 */
  className?: string
  /** 是否忽略全局“显示/隐藏”开关（例如单独页强制显示） */
  forceVisible?: boolean
}

/**
 * 粒子背景，供各工具页使用；受 BackgroundVisibilityProvider 控制全局显示/隐藏
 */
const ParticlesBackground: React.FC<ParticlesBackgroundProps> = ({
  preset = 'minimal',
  options: overrides,
  className = '',
  forceVisible = false,
}) => {
  const [init, setInit] = useState(false)
  const { visible: globalVisible } = useBackgroundVisibility()
  const show = forceVisible || globalVisible

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine)
    }).then(() => setInit(true))
  }, [])

  const options = useMemo(() => {
    const base = particlesPresets[preset] ?? particlesPresets.minimal
    return overrides ? { ...base, ...overrides } : base
  }, [preset, overrides])

  if (!show) return null
  if (!init) return null

  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-0 overflow-hidden',
        className
      )}
      aria-hidden
    >
      <Particles
        id="toolbox-particles"
        options={options}
        className="absolute inset-0"
      />
    </div>
  )
}

export default ParticlesBackground
