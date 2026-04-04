import type { ToolManifest } from '../../../apps/web/src/types/tool';

const manifest: ToolManifest = {
  id: 'trending-spots',
  name: 'TrendingSpots',
  path: '/trending-spots',
  categoryKey: 'travel',
  icon: '📸',
  title: {
    zh: '网红景点生成器',
    en: 'Trending Spots Generator',
  },
  description: {
    zh: '发现热门打卡点，记录美好瞬间',
    en: 'Discover popular check-in spots and capture beautiful moments',
  },
  keywords: {
    zh: ['网红景点', '打卡地', '旅游推荐', '热门景点', '拍照圣地'],
    en: ['trending spots', 'check-in places', 'travel recommendations', 'popular attractions', 'photo spots'],
  },
};

export default manifest;
