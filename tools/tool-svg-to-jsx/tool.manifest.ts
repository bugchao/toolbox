import { defineToolManifest } from '@toolbox/tool-registry'
import { Code2 } from 'lucide-react'

const toolSvgToJsxManifest = defineToolManifest({
  id: 'tool-svg-to-jsx',
  path: '/svg-to-jsx',
  namespace: 'toolSvgToJsx',
  mode: 'client',
  categoryKey: 'dev',
  icon: Code2,
  keywords: [
    'svg',
    'jsx',
    'react',
    'svgo',
    'component',
    'icon',
    'optimize',
    'svg 优化',
    'svg 转组件',
    'svg 转 jsx',
    '图标',
    '组件',
    'forwardRef',
  ],
  meta: {
    zh: {
      title: 'SVG 优化转 JSX',
      description: '优化 SVG 并转成 React 组件，支持 TypeScript 与 forwardRef。',
    },
    en: {
      title: 'SVG to JSX',
      description: 'Optimize SVG and convert to a React component with TS and forwardRef.',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolSvgToJsxManifest
