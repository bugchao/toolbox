import { defineToolManifest } from '@toolbox/tool-registry'
import { LayoutTemplate } from 'lucide-react'

const toolSystemDesignManifest = defineToolManifest({
  id: 'tool-system-design',
  path: '/system-design',
  namespace: 'toolSystemDesign',
  mode: 'client',
  categoryKey: 'learn',
  icon: LayoutTemplate,
  keywords: ['system design', '架构设计', '设计题', 'distributed system'],
  meta: {
    zh: {
      title: '系统设计演练',
      description: '围绕场景、规模和约束生成一版系统设计思路',
    },
    en: {
      title: 'System Design',
      description: 'Sketch a system design plan from scenario, scale, and priority',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolSystemDesignManifest
