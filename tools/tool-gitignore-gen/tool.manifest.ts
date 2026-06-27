import { defineToolManifest } from '@toolbox/tool-registry'
import { FolderGit2 } from 'lucide-react'

const toolGitignoreGenManifest = defineToolManifest({
  id: 'tool-gitignore-gen',
  path: '/gitignore-gen',
  namespace: 'toolGitignoreGen',
  mode: 'client',
  categoryKey: 'dev',
  icon: FolderGit2,
  keywords: [
    'gitignore',
    'git',
    '忽略文件',
    '模板',
    'template',
    'node',
    'python',
    'ignore 生成',
    '版本控制',
    'vcs',
  ],
  meta: {
    zh: {
      title: '.gitignore 生成器',
      description: '勾选常用模板，一键生成并下载 .gitignore 文件',
    },
    en: {
      title: '.gitignore Generator',
      description: 'Pick common templates to build and download a .gitignore',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolGitignoreGenManifest
