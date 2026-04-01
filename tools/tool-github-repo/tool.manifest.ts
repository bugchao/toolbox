import { Github } from 'lucide-react'
import { defineToolManifest } from '@toolbox/tool-registry'

const toolGithubRepoManifest = defineToolManifest({
  id: 'tool-github-repo',
  path: '/github-repo',
  namespace: 'toolGithubRepo',
  mode: 'client',
  categoryKey: 'dev',
  icon: Github,
  keywords: ['github', 'repo', 'star', 'fork'],
  meta: {
    zh: {
      title: 'GitHub 仓库分析',
      description: '查询公开仓库信息、热度和最近活跃情况',
    },
    en: {
      title: 'GitHub Repo',
      description: 'Inspect public repository metadata, popularity, and recent activity',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolGithubRepoManifest
