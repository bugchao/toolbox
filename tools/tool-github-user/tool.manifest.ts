import { Github } from 'lucide-react'
import { defineToolManifest } from '@toolbox/tool-registry'

const toolGithubUserManifest = defineToolManifest({
  id: 'tool-github-user',
  path: '/github-user',
  namespace: 'toolGithubUser',
  mode: 'client',
  categoryKey: 'dev',
  icon: Github,
  keywords: ['github', 'user', 'profile', 'repos'],
  meta: {
    zh: {
      title: 'GitHub 用户分析',
      description: '查询公开 GitHub 用户资料、关注数据和最近仓库',
    },
    en: {
      title: 'GitHub User',
      description: 'Inspect public GitHub profile data, social counts, and recent repositories',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolGithubUserManifest
