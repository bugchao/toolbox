// 学习工具配置 - Learning Tools
// 包含：学习计时/计划/专注/单词/错题等工具

import type { ToolEntry } from './tools'
import {
  GraduationCap, CalendarDays, Crosshair, BookOpen, BookMarked,
  Brain, BookA, BookCopy, LayoutList, Lightbulb, Baby, Binoculars, Type
} from 'lucide-react'

export const LEARNING_TOOLS: ToolEntry[] = [
  // 学习管理（3 个）
  { path: '/study-timer', nameKey: 'tools.study_timer', icon: GraduationCap, categoryKey: 'learn', keywords: ['学习', '计时', '专注', '统计'], i18nNamespace: 'toolStudyTimer' },
  { path: '/study-planner', nameKey: 'tools.study_planner', icon: CalendarDays, categoryKey: 'learn', keywords: ['学习', '计划', 'AI', '复习', '备考'], i18nNamespace: 'toolStudyPlanner' },
  { path: '/focus-mode', nameKey: 'tools.focus_mode', icon: Crosshair, categoryKey: 'learn', keywords: ['专注', '番茄钟', '计时', '白噪音', '沉浸'], i18nNamespace: 'toolFocusMode' },

  // 学习辅助（5 个）
  { path: '/spaced-repetition', nameKey: 'tools.spaced_repetition', icon: BookOpen, categoryKey: 'learn', keywords: ['间隔重复', 'anki', '记忆', 'spaced repetition'], i18nNamespace: 'toolSpacedRepetition' },
  { path: '/vocab-trainer', nameKey: 'tools.vocab_trainer', icon: BookA, categoryKey: 'learn', keywords: ['单词', 'vocabulary', '记忆', 'flashcard'], i18nNamespace: 'toolVocabTrainer' },
  { path: '/mistake-book', nameKey: 'tools.mistake_book', icon: BookMarked, categoryKey: 'learn', keywords: ['错题', '题本', '复习'], i18nNamespace: 'toolMistakeBook' },
  { path: '/quiz-gen', nameKey: 'tools.quiz_gen', icon: Brain, categoryKey: 'learn', keywords: ['出题', '竞答', '知识', 'quiz'], i18nNamespace: 'toolQuizGen' },
  { path: '/mcq-gen', nameKey: 'tools.mcq_gen', icon: LayoutList, categoryKey: 'learn', keywords: ['选择题', '出题', 'quiz', '测验'], i18nNamespace: 'toolMcqGen' },

  // 知识理解（5 个）
  { path: '/knowledge-compare', nameKey: 'tools.knowledge_compare', icon: BookCopy, categoryKey: 'learn', keywords: ['对比', '比较', 'compare', '技术选型'], i18nNamespace: 'toolKnowledgeCompare' },
  { path: '/one-liner', nameKey: 'tools.one_liner', icon: Lightbulb, categoryKey: 'learn', keywords: ['一句话', '解释', 'one liner', '概念'], i18nNamespace: 'toolOneLiner' },
  { path: '/eli5', nameKey: 'tools.eli5', icon: Baby, categoryKey: 'learn', keywords: ['ELI5', '简单解释', '5 岁', '类比'], i18nNamespace: 'toolEli5' },
  { path: '/multi-perspective', nameKey: 'tools.multi_perspective', icon: Binoculars, categoryKey: 'learn', keywords: ['多角度', '视角', '专家', '类比'], i18nNamespace: 'toolMultiPerspective' },
]
