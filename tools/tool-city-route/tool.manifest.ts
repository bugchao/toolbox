import type { ToolManifest } from '../../../apps/web/src/types/tool';

const manifest: ToolManifest = {
  id: 'city-route',
  name: 'CityRoute',
  path: '/city-route',
  categoryKey: 'travel',
  icon: '🗺️',
  title: {
    zh: '城市游玩路线生成',
    en: 'City Route Generator',
  },
  description: {
    zh: '智能规划单城市景点路线',
    en: 'Intelligently plan single-city attraction routes',
  },
  keywords: {
    zh: ['城市路线', '景点规划', '路线生成', '旅游路线', '行程优化'],
    en: ['city route', 'attraction planning', 'route generation', 'travel route', 'itinerary optimization'],
  },
};

export default manifest;
