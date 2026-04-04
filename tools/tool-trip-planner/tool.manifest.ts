import type { ToolManifest } from '../../../apps/web/src/types/tool';

const manifest: ToolManifest = {
  id: 'trip-planner',
  name: 'TripPlanner',
  path: '/trip-planner',
  categoryKey: 'travel',
  icon: '✈️',
  title: {
    zh: 'AI 行程规划器',
    en: 'AI Trip Planner',
  },
  description: {
    zh: '输入预算和天数，AI 生成个性化旅行计划',
    en: 'Enter budget and days, AI generates personalized travel plans',
  },
  keywords: {
    zh: ['行程规划', '旅行计划', 'AI规划', '旅游攻略', '行程安排'],
    en: ['trip planner', 'travel plan', 'AI planning', 'travel guide', 'itinerary'],
  },
};

export default manifest;
