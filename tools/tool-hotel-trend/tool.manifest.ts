import type { ToolManifest } from '../../../apps/web/src/types/tool';

const manifest: ToolManifest = {
  id: 'hotel-trend',
  name: 'HotelTrend',
  path: '/hotel-trend',
  categoryKey: 'travel',
  icon: '📊',
  title: {
    zh: '酒店价格趋势',
    en: 'Hotel Price Trends',
  },
  description: {
    zh: '查看酒店价格变化，选择最佳预订时机',
    en: 'View hotel price changes and choose the best booking time',
  },
  keywords: {
    zh: ['酒店价格', '价格趋势', '酒店预订', '价格分析', '最佳时机'],
    en: ['hotel prices', 'price trends', 'hotel booking', 'price analysis', 'best timing'],
  },
};

export default manifest;
