import type { ToolManifest } from '../../../apps/web/src/types/tool';

const manifest: ToolManifest = {
  id: 'travel-story',
  name: 'TravelStory',
  path: '/travel-story',
  categoryKey: 'travel',
  icon: '✍️',
  title: {
    zh: '旅行故事生成',
    en: 'Travel Story Generator',
  },
  description: {
    zh: 'AI 帮你把旅行经历变成精彩故事',
    en: 'AI helps you turn travel experiences into wonderful stories',
  },
  keywords: {
    zh: ['旅行故事', '游记生成', 'AI写作', '旅行记录', '故事创作'],
    en: ['travel story', 'travel journal', 'AI writing', 'travel log', 'story creation'],
  },
};

export default manifest;
