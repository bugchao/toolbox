import { defineToolManifest } from '@toolbox/tool-registry'
import { GitBranch } from 'lucide-react'

const toolMermaidManifest = defineToolManifest({
  id: 'tool-mermaid',
  path: '/mermaid',
  namespace: 'toolMermaid',
  mode: 'client',
  categoryKey: 'dev',
  icon: GitBranch,
  keywords: [
    'mermaid',
    'diagram',
    'flowchart',
    'sequence',
    'class diagram',
    'state diagram',
    'gantt',
    'pie',
    'mindmap',
    'er diagram',
    'svg',
    'png',
    '流程图',
    '时序图',
    '类图',
    '状态图',
    '甘特图',
    '饼图',
    '思维导图',
    'ER 图',
    '图表',
  ],
  meta: {
    zh: {
      title: 'Mermaid 在线渲染',
      description: '粘贴 Mermaid 源码即可在浏览器中实时渲染图表，支持流程图、时序图、类图、状态图、ER 图、甘特图、饼图、思维导图等，并可一键导出 SVG / PNG，本地处理不上传。',
    },
    en: {
      title: 'Mermaid Live Renderer',
      description: 'Paste Mermaid source and render diagrams live in the browser. Supports flowchart, sequence, class, state, ER, gantt, pie and mindmap, with one-click SVG / PNG export. Fully local, no upload.',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolMermaidManifest
