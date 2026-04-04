import type { ToolManifest } from '../../../apps/web/src/types/tool';

const manifest: ToolManifest = {
  id: 'pronunciation-eval',
  name: 'PronunciationEval',
  path: '/pronunciation-eval',
  categoryKey: 'learn',
  icon: '🎤',
  title: {
    zh: '发音评估工具',
    en: 'Pronunciation Evaluation',
  },
  description: {
    zh: 'AI 评估你的英语发音，提供改进建议',
    en: 'AI evaluates your English pronunciation and provides improvement suggestions',
  },
  keywords: {
    zh: ['发音评估', '英语发音', '语音识别', '口语练习', '发音纠正'],
    en: ['pronunciation evaluation', 'English pronunciation', 'speech recognition', 'speaking practice', 'pronunciation correction'],
  },
};

export default manifest;
