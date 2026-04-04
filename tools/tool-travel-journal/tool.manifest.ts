import type { ToolManifest } from '../../../apps/web/src/types/tool';

const manifest: ToolManifest = {
  id: 'travel-journal',
  name: 'TravelJournal',
  path: '/travel-journal',
  categoryKey: 'travel',
  icon: '📖',
  title: {
    zh: '游记自动生成',
    en: 'Travel Journal Generator',
  },
  description: {
    zh: '记录每一天的旅行，自动生成精美游记',
    en: 'Record each day of travel and automatically generate beautiful journals',
  },
  keywords: {
    zh: ['游记生成', '旅行日记', '自动生成', '旅行记录', '游记写作'],
    en: ['journal generator', 'travel diary', 'auto generate', 'travel log', 'journal writing'],
  },
};

export default manifest;
