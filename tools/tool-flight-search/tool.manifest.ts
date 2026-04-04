import type { ToolManifest } from '../../../apps/web/src/types/tool';

const manifest: ToolManifest = {
  id: 'flight-search',
  name: 'FlightSearch',
  path: '/flight-search',
  categoryKey: 'travel',
  icon: '✈️',
  title: {
    zh: '航班信息查询',
    en: 'Flight Search',
  },
  description: {
    zh: '聚合多个平台的航班信息，快速找到最优航班',
    en: 'Aggregate flight information from multiple platforms to find the best flights',
  },
  keywords: {
    zh: ['航班查询', '机票搜索', '航班比价', '机票预订', '航班信息'],
    en: ['flight search', 'ticket search', 'flight comparison', 'flight booking', 'flight information'],
  },
};

export default manifest;
