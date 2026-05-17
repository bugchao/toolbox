import { defineToolManifest } from '@toolbox/tool-registry'
import { MessageCircleQuestion } from 'lucide-react'

const toolTruthDareManifest = defineToolManifest({
  id: 'tool-truth-dare',
  path: '/truth-dare',
  namespace: 'toolTruthDare',
  mode: 'client',
  categoryKey: 'social_game',
  icon: MessageCircleQuestion,
  keywords: ['真心话', '大冒险', '聚会', '桌游', '游戏', 'truth', 'dare', 'party'],
  meta: {
    zh: {
      title: '真心话大冒险',
      description: '聚会神器：随机抽真心话/大冒险题目，内置 4 档难度题库，可自定义题目与玩家轮转',
    },
    en: {
      title: 'Truth or Dare',
      description: 'Party-ready Truth-or-Dare: 4 difficulty tiers, custom prompts, and player rotation',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolTruthDareManifest
