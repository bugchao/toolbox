import type { ToolManifest } from '../../../apps/web/src/types/tool';

const manifest: ToolManifest = {
  id: 'restaurant-finder',
  name: 'RestaurantFinder',
  path: '/restaurant-finder',
  categoryKey: 'travel',
  icon: '🍽️',
  title: {
    zh: '餐厅推荐',
    en: 'Restaurant Finder',
  },
  description: {
    zh: '根据时间、预算和偏好，找到最适合的餐厅',
    en: 'Find the best restaurants based on time, budget and preferences',
  },
  keywords: {
    zh: ['餐厅推荐', '美食搜索', '餐厅查询', '用餐推荐', '美食指南'],
    en: ['restaurant finder', 'food search', 'restaurant query', 'dining recommendations', 'food guide'],
  },
};

export default manifest;
