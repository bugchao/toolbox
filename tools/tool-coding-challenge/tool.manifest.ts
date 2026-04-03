import { defineToolManifest } from '@toolbox/tool-registry'
import { Code2 } from 'lucide-react'

const toolCodingChallengeManifest = defineToolManifest({
  id: 'tool-coding-challenge',
  path: '/coding-challenge',
  namespace: 'toolCodingChallenge',
  mode: 'client',
  categoryKey: 'learn',
  icon: Code2,
  keywords: ['coding challenge', '练习题', '面试题', '算法', '前端'],
  meta: {
    zh: {
      title: '编程挑战生成器',
      description: '按方向、难度和时间生成一套可执行的编程练习任务',
    },
    en: {
      title: 'Coding Challenge',
      description: 'Generate a practice-ready coding challenge from topic, difficulty, and time',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolCodingChallengeManifest
