import type { ISourceOptions } from '@tsparticles/engine'

/**
 * 各工具可选的粒子预设 key，用于 ParticlesBackground 的 preset 属性
 */
export type ParticlesPresetKey =
  | 'dots'
  | 'snow'
  | 'stars'
  | 'network'
  | 'bubble'
  | 'minimal'

export const particlesPresets: Record<ParticlesPresetKey, ISourceOptions> = {
  dots: {
    fullScreen: { enable: false },
    particles: {
      number: { value: 60 },
      color: { value: ['#6366f1', '#8b5cf6'] },
      opacity: { value: 0.4 },
      size: { value: { min: 1, max: 3 } },
      move: { enable: true, speed: 1 },
    },
    background: { color: 'transparent' },
  },
  snow: {
    fullScreen: { enable: false },
    particles: {
      number: { value: 80 },
      color: { value: '#ffffff' },
      opacity: { value: 0.6 },
      size: { value: { min: 1, max: 4 } },
      move: { enable: true, speed: 1, direction: 'bottom' },
    },
    background: { color: 'transparent' },
  },
  stars: {
    fullScreen: { enable: false },
    particles: {
      number: { value: 100 },
      color: { value: ['#818cf8', '#c4b5fd'] },
      opacity: { value: { min: 0.2, max: 0.6 } },
      size: { value: { min: 0.5, max: 2 } },
      move: { enable: true, speed: 0.5 },
    },
    background: { color: 'transparent' },
  },
  network: {
    fullScreen: { enable: false },
    particles: {
      number: { value: 40 },
      color: { value: '#6366f1' },
      opacity: { value: 0.3 },
      size: { value: 1 },
      links: {
        enable: true,
        color: '#6366f1',
        opacity: 0.2,
        distance: 150,
      },
      move: { enable: true, speed: 0.5 },
    },
    background: { color: 'transparent' },
  },
  bubble: {
    fullScreen: { enable: false },
    particles: {
      number: { value: 30 },
      color: { value: ['#6366f1', '#8b5cf6'] },
      opacity: { value: { min: 0.1, max: 0.3 } },
      size: { value: { min: 20, max: 80 } },
      move: { enable: true, speed: 0.5 },
    },
    background: { color: 'transparent' },
  },
  minimal: {
    fullScreen: { enable: false },
    particles: {
      number: { value: 25 },
      color: { value: '#6366f1' },
      opacity: { value: 0.25 },
      size: { value: 2 },
      move: { enable: true, speed: 0.3 },
    },
    background: { color: 'transparent' },
  },
}
