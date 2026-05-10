import { defineToolManifest } from '@toolbox/tool-registry'
import { Shuffle } from 'lucide-react'

const toolNameGeneratorManifest = defineToolManifest({
  id: 'tool-name-generator',
  path: '/name-generator',
  namespace: 'toolNameGenerator',
  mode: 'client',
  categoryKey: 'utils',
  icon: Shuffle,
  keywords: ['name', 'generator', 'random', 'username', 'nickname', '名字', '生成器', '昵称'],
  meta: {
    zh: {
      title: '随机名字生成器',
      description: '生成各种类型的随机名字，包括中文、英文、用户名等',
    },
    en: {
      title: 'Name Generator',
      description: 'Generate various types of random names including Chinese, English, usernames, etc.',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolNameGeneratorManifest
