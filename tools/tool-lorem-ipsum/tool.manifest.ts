import { defineToolManifest } from '@toolbox/tool-registry'
import { Pilcrow } from 'lucide-react'

const toolLoremIpsumManifest = defineToolManifest({
  id: 'tool-lorem-ipsum',
  path: '/lorem-ipsum',
  namespace: 'toolLoremIpsum',
  mode: 'client',
  categoryKey: 'dev',
  icon: Pilcrow,
  keywords: [
    'lorem',
    'ipsum',
    'placeholder',
    'dummy',
    'filler',
    'mockup',
    '占位',
    '假文',
    '乱数',
    '填充',
    '设计',
  ],
  meta: {
    zh: {
      title: 'Lorem Ipsum 生成器',
      description: '生成经典 Lorem Ipsum 假文与中文「乱数假文」，按段 / 句 / 词控制长度，输出 Plain / Markdown / HTML 三种格式。可选种子保证可重现。',
    },
    en: {
      title: 'Lorem Ipsum Generator',
      description: 'Generate classic Lorem Ipsum or Chinese pseudo-text by paragraphs / sentences / words. Output Plain / Markdown / HTML with optional deterministic seed.',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolLoremIpsumManifest
