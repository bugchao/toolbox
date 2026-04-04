import type { ToolManifest } from '../../../apps/web/src/types/tool';

const manifest: ToolManifest = {
  id: 'travel-guide-summary',
  name: 'TravelGuideSummary',
  path: '/travel-guide-summary',
  categoryKey: 'travel',
  icon: '📋',
  title: {
    zh: '旅行攻略总结器',
    en: 'Travel Guide Summarizer',
  },
  description: {
    zh: 'AI 提取攻略要点，生成结构化总结',
    en: 'AI extracts key points from guides and generates structured summaries',
  },
  keywords: {
    zh: ['旅行攻略', '攻略总结', 'AI总结', '旅游规划', '攻略提取'],
    en: ['travel guide', 'guide summary', 'AI summary', 'travel planning', 'guide extraction'],
  },
};

export default manifest;
