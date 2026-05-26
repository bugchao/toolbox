import { defineToolManifest } from '@toolbox/tool-registry'
import { ScanSearch } from 'lucide-react'

const toolAiDetectorManifest = defineToolManifest({
  id: 'tool-ai-detector',
  path: '/ai-detector',
  namespace: 'toolAiDetector',
  mode: 'client',
  categoryKey: 'ai',
  icon: ScanSearch,
  keywords: [
    'ai',
    'detector',
    'gpt',
    'aigc',
    'content',
    'plagiarism',
    'ai检测',
    'ai识别',
    'gpt检测',
    '人工智能',
    '生成内容',
  ],
  meta: {
    zh: {
      title: 'AI 检测（启发式）',
      description: '本地启发式 AI 内容检测：文本与图片输入 → AI 倾向分 + 三档分类 + 可解释特征明细，无需联网或 API key。',
    },
    en: {
      title: 'AI Content Detector (Heuristic)',
      description: 'Local heuristic AI content detector for text and images: a 0–100 likelihood score with three-tier verdict and per-feature breakdown — no API key, no network.',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolAiDetectorManifest
