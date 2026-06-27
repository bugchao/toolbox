import { defineToolManifest } from '@toolbox/tool-registry'
import { KeyRound } from 'lucide-react'

const toolHtpasswdManifest = defineToolManifest({
  id: 'tool-htpasswd',
  path: '/htpasswd',
  namespace: 'toolHtpasswd',
  mode: 'client',
  categoryKey: 'dev',
  icon: KeyRound,
  keywords: [
    'htpasswd',
    'basic auth',
    'apache',
    'nginx',
    'bcrypt',
    'apr1',
    'sha1',
    '密码',
    '认证',
    '凭据',
    'password',
    'credentials',
  ],
  meta: {
    zh: {
      title: 'Htpasswd 生成器',
      description: '本地生成 Apache/Nginx Basic Auth 凭据，支持 bcrypt、apr1、SHA。',
    },
    en: {
      title: 'Htpasswd Generator',
      description: 'Generate Apache/Nginx Basic Auth credentials locally (bcrypt, apr1, SHA).',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolHtpasswdManifest
