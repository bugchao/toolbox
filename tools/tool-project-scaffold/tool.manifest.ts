import { FolderTree } from 'lucide-react'
import { defineToolManifest } from '@toolbox/tool-registry'

const toolProjectScaffoldManifest = defineToolManifest({
  id: 'tool-project-scaffold',
  path: '/project-scaffold',
  namespace: 'toolProjectScaffold',
  mode: 'client',
  categoryKey: 'dev',
  icon: FolderTree,
  keywords: ['项目结构', '脚手架', '目录树', '生成器'],
  meta: {
    zh: {
      title: '项目结构生成器',
      description: '选择框架和功能模块，一键生成项目目录树',
    },
    en: {
      title: 'Project Scaffold',
      description: 'Generate project folder trees from framework and feature selections',
    },
  },
  loadComponent: () => import('./src/ProjectScaffold'),
  loadMessages: {
    zh: () => import('./locales/zh-CN.json'),
    en: () => import('./locales/en-US.json'),
  },
})

export default toolProjectScaffoldManifest
