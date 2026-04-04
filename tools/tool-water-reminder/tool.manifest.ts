import type { ToolManifest } from '../../../apps/web/src/types/tool';

const manifest: ToolManifest = {
  id: 'water-reminder',
  name: 'WaterReminder',
  path: '/water-reminder',
  categoryKey: 'life',
  icon: '💧',
  title: {
    zh: '饮水提醒工具',
    en: 'Water Reminder',
  },
  description: {
    zh: '记录每日饮水量，养成健康饮水习惯',
    en: 'Track daily water intake and develop healthy drinking habits',
  },
  keywords: {
    zh: ['饮水提醒', '饮水记录', '健康管理', '饮水追踪', '喝水提醒'],
    en: ['water reminder', 'water tracking', 'health management', 'hydration tracker', 'drink reminder'],
  },
};

export default manifest;
