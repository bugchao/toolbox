import { defineToolManifest } from '@toolbox/tool-registry'
import { Spline } from 'lucide-react'

const toolCubicBezierManifest = defineToolManifest({
  id: 'tool-cubic-bezier',
  path: '/cubic-bezier',
  namespace: 'toolCubicBezier',
  mode: 'client',
  categoryKey: 'dev',
  icon: Spline,
  keywords: [
    'cubic-bezier',
    'bezier',
    'easing',
    'animation',
    'timing-function',
    'css',
    'transition',
    'curve',
    '贝塞尔',
    '缓动',
    '动画',
    '曲线',
    '过渡',
  ],
  meta: {
    zh: {
      title: 'CSS 缓动曲线编辑器',
      description: '可视化拖拽编辑 cubic-bezier 控制点，实时预览动画速度曲线；内置 ease / easeInOutCubic / easeOutBack 等预设，一键复制 CSS。',
    },
    en: {
      title: 'CSS Cubic Bezier Editor',
      description: 'Drag control points to design a cubic-bezier easing curve. Live animation preview, presets like easeInOutCubic and easeOutBack, one-click CSS copy.',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolCubicBezierManifest
