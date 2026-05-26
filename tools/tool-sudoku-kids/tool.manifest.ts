import { defineToolManifest } from '@toolbox/tool-registry'
import { Grid3x3 } from 'lucide-react'

const toolSudokuKidsManifest = defineToolManifest({
  id: 'tool-sudoku-kids',
  path: '/sudoku-kids',
  namespace: 'toolSudokuKids',
  mode: 'client',
  categoryKey: 'learn',
  icon: Grid3x3,
  keywords: [
    'sudoku',
    'kids',
    'children',
    'logic',
    'math',
    'puzzle',
    'levels',
    '数独',
    '儿童',
    '逻辑',
    '数学',
    '闯关',
    '益智',
  ],
  meta: {
    zh: {
      title: '数独闯关（儿童版）',
      description: '面向小朋友的数独闯关游戏：4×4 / 6×6 / 9×9 三档难度，30 关递进，三星评分与学习辅助。',
    },
    en: {
      title: 'Sudoku Quest for Kids',
      description: 'Kid-friendly sudoku with 30 levels across 4×4, 6×6 and 9×9 difficulties, three-star scoring and learning helpers.',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolSudokuKidsManifest
